'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Case } from '@/types/case'

interface SearchAndFilterProps {
  onSearch: (query: string, filters: FilterOptions) => void
  cases: Case[]
}

interface FilterOptions {
  status?: string[]
  jurisdiction?: string
  priority?: string[]
  dateFrom?: string
  dateTo?: string
}

export default function SearchAndFilter({ onSearch, cases }: SearchAndFilterProps) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({})

  const uniqueJurisdictions = Array.from(new Set(
    cases.map(c => c.jurisdiction).filter(Boolean)
  ))

  const handleSearch = () => {
    onSearch(query, filters)
  }

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({})
    setQuery('')
    onSearch('', {})
  }

  return (
    <div className="bg-detective-secondary/50 rounded-xl p-4 border border-detective-secondary mb-6">
      <div className="flex gap-3">
        {/* Search input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search cases by title, description, or case number..."
            className="w-full pl-10 pr-4 py-2 bg-detective-darker border border-detective-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-detective-accent"
          />
        </div>

        {/* Filter button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-detective-light hover:bg-detective-light/80 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <Filter className="w-5 h-5" />
          Filters
        </button>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-detective-accent hover:bg-detective-accent/90 text-white rounded-lg font-semibold transition-colors"
        >
          Search
        </button>

        {/* Clear button */}
        {(query || Object.keys(filters).length > 0) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-detective-light grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
            <select
              multiple
              value={filters.status || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value)
                handleFilterChange('status', values.length > 0 ? values : undefined)
              }}
              className="w-full px-3 py-2 bg-detective-darker border border-detective-light rounded-lg text-white text-sm"
            >
              <option value="open">Open</option>
              <option value="analyzing">Analyzing</option>
              <option value="solved">Solved</option>
              <option value="cold">Cold</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Jurisdiction filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Jurisdiction</label>
            <select
              value={filters.jurisdiction || ''}
              onChange={(e) => handleFilterChange('jurisdiction', e.target.value || undefined)}
              className="w-full px-3 py-2 bg-detective-darker border border-detective-light rounded-lg text-white text-sm"
            >
              <option value="">All</option>
              {uniqueJurisdictions.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Priority</label>
            <select
              multiple
              value={filters.priority || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value)
                handleFilterChange('priority', values.length > 0 ? values : undefined)
              }}
              className="w-full px-3 py-2 bg-detective-darker border border-detective-light rounded-lg text-white text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Date range */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Date Range</label>
            <div className="space-y-2">
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-detective-darker border border-detective-light rounded-lg text-white text-sm"
                placeholder="From"
              />
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-detective-darker border border-detective-light rounded-lg text-white text-sm"
                placeholder="To"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
