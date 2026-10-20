#!/usr/bin/env python3
"""Real HTTP concurrency/retry tests; only this worktree's disposable local stack."""
import concurrent.futures
import importlib.util
import pathlib
import uuid
from urllib.error import HTTPError

def main():
    spec = importlib.util.spec_from_file_location("local_db", pathlib.Path(__file__).resolve().parents[1] / "local-db.py")
    local = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(local)
    info = local.status()  # refuses non-local API targets
    one, two = [local.login(info, email) for email in local.EMAILS]
    owner = local.request(info, "/auth/v1/user", one)["id"]
    key = str(uuid.uuid4())
    name = "Synthetic import " + key
    payload = {"request_key": key, "file_digest": "a" * 64,
               "accepted_rows": [{"name": name, "industry": "roofing"}],
               "invalid_count": 1, "duplicate_count": 1}

    def call(token=one, data=payload):
        return local.request(info, "/rest/v1/rpc/confirm_business_import", token, data)

    def denied(fn):
        try:
            fn()
        except HTTPError as error:
            assert error.code in {400, 401, 403}, error.code
        else:
            raise AssertionError("Expected denied operation")

    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            assert list(executor.map(lambda _: call(), range(8))) == [1] * 8
        rows = local.request(info, "/rest/v1/businesses?select=id&name=eq." + name.replace(" ", "%20"), one)
        assert len(rows) == 1, "Concurrent requests inserted more than one batch"
        # Simulate losing the first response: discard it, retry without changing key.
        call()
        assert call() == 1
        denied(lambda: call(data={**payload, "file_digest": "b" * 64}))
        assert local.request(info, "/rest/v1/business_import_receipts?request_key=eq." + key, two) == []
        denied(lambda: local.request(info, "/rest/v1/business_import_receipts", two,
                                    {"owner_id": owner, "request_key": str(uuid.uuid4()), "payload_digest": "fake", "inserted_count": 1}))
        # Same key belongs to a separate namespace for the other owner.
        assert call(two) == 1
        local.request(info, "/rest/v1/businesses?id=eq." + rows[0]["id"], two, {"name": "Unauthorized"}, "PATCH")
        assert local.request(info, "/rest/v1/businesses?id=eq." + rows[0]["id"], one)[0]["name"] == name
        local.request(info, "/rest/v1/businesses?id=eq." + rows[0]["id"], one, {"name": name + " edited"}, "PATCH")
        assert call() == 1
        local.request(info, "/rest/v1/businesses?id=eq." + rows[0]["id"], one, method="DELETE")
        assert call() == 1
        assert local.request(info, "/rest/v1/businesses?id=eq." + rows[0]["id"], one) == []
        denied(lambda: call(data={**payload, "request_key": str(uuid.uuid4()), "accepted_rows": [{"name": "", "industry": "roofing"}]}))
        print("PASS: eight concurrent confirmations, response-loss retry, changed payload rejection, two-owner receipt/record isolation, edit/delete retry durability, direct receipt write denial.")
    finally:
        for token in (one, two):
            local.request(info, "/rest/v1/businesses?name=eq." + name.replace(" ", "%20"), token, method="DELETE")


if __name__ == "__main__":
    main()
