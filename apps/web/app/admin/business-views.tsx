'use client'
import Link from 'next/link'
import { Icon } from '@/app/ui/ui-icon'
import { useSyncExternalStore, useState } from 'react'
import type { Business } from '@/lib/businesses/repository'
const preferenceKey = 'weblix-business-view'
const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback)
  window.addEventListener('weblix-view', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('weblix-view', callback)
  }
}
function storedView () {
  try {
    return localStorage.getItem(preferenceKey) === 'compact'
      ? 'compact'
      : 'grid'
  } catch {
    return 'grid'
  }
}
function websiteLabel (website: string | null) {
  if (!website) return 'Website not provided'
  try {
    return new URL(website).host
  } catch {
    return website
  }
}
export function BusinessViews ({ businesses }: { businesses: Business[] }) {
  const stored = useSyncExternalStore(subscribe, storedView, () => 'grid')
  const [chosen, setChosen] = useState<string>()
  const view = chosen ?? stored
  const [search, setSearch] = useState('')
  const query = search.trim().toLocaleLowerCase()
  const matches = businesses.filter(business =>
    [
      business.name,
      business.industry,
      business.website,
      business.city,
      business.state
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase()
      .includes(query)
  )
  function select (next: string) {
    setChosen(next)
    try {
      localStorage.setItem(preferenceKey, next)
      window.dispatchEvent(new Event('weblix-view'))
    } catch {
      /* Browsing remains usable without storage. */
    }
  }
  return (
    <>
      <div className='business-toolbar'>
        <div className='search-field'>
          <label className='sr-only' htmlFor='business-search'>
            Search businesses
          </label>
          <Icon name='search' />
          <input
            type='search'
            id='business-search'
            placeholder='Search businesses…'
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        <div className='view-switch' role='group' aria-label='Business view'>
          {['grid', 'compact'].map(option => (
            <button
              key={option}
              type='button'
              aria-pressed={view === option}
              onClick={() => select(option)}
            >
              <Icon name={option === 'grid' ? 'grid' : 'compact'} />
              {option === 'grid' ? 'Grid' : 'Compact'}
            </button>
          ))}
        </div>
      </div>
      <p role='status' className='result-count sr-only'>
        {matches.length} {matches.length === 1 ? 'business' : 'businesses'}
        {query ? ' matching your search' : ' in your workspace'}
      </p>
      {businesses.length === 0 ? (
        <div className='empty-panel'>
          <h2>No businesses yet</h2>
          <p>Add your first business or import a CSV to get started.</p>
        </div>
      ) : matches.length === 0 ? (
        <div className='empty-panel'>
          <h2>No matching businesses</h2>
          <p>Try a different name, industry, website or location.</p>
          <button className='secondary' onClick={() => setSearch('')}>
            Clear search
          </button>
        </div>
      ) : (
        <ul className={`business-list ${view}`}>
          {matches.map(business => (
            <li key={business.id} className='business-card'>
              {/* A small initial tile stands in until real website previews exist. */}
              <div className='website-placeholder' aria-hidden='true'>
                <span className='placeholder-initial'>{business.name.trim().slice(0, 1).toUpperCase()}</span>
                <span className='placeholder-label'>No preview yet</span>
              </div>
              <div className='business-meta'>
                <h2>
                  <Link className='business-name' href={`/admin/businesses/${business.id}`}>
                    {business.name}
                  </Link>
                </h2>
                <p>{business.industry}</p>
                <p className='business-domain'>
                  <Icon name='link' />
                  {websiteLabel(business.website)}
                </p>
              </div>
              <p className='business-location'>
                <Icon name='location' />
                {[business.city, business.state].filter(Boolean).join(', ') ||
                  'Location not provided'}
              </p>
              <div className='business-actions'>
                <Link
                  className='secondary'
                  href={`/admin/businesses/${business.id}/content`}
                  aria-label={`Edit website for ${business.name}`}
                >
                  Edit website <Icon name='arrow' />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
