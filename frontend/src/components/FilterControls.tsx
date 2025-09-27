import { Filter, Search, X } from 'lucide-react';
import React from 'react';

interface FilterControlsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  limitValue: number;
  onLimitChange: (value: number) => void;
  categoryValue?: string;
  onCategoryChange?: (value: string) => void;
  categories?: string[];
  showCategory?: boolean;
  placeholder?: string;
  limitOptions?: number[];
}

const FilterControls: React.FC<FilterControlsProps> = ({
  searchValue,
  onSearchChange,
  limitValue,
  onLimitChange,
  categoryValue = '',
  onCategoryChange,
  categories = [],
  showCategory = false,
  placeholder = "Search...",
  limitOptions = [10, 20, 50]
}) => {
  const clearSearch = () => {
    onSearchChange('');
  };

  const clearCategory = () => {
    if (onCategoryChange) {
      onCategoryChange('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={placeholder}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {searchValue && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter */}
        {showCategory && categories.length > 0 && (
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={categoryValue}
              onChange={(e) => onCategoryChange?.(e.target.value)}
              className="block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {categoryValue && (
              <button
                onClick={clearCategory}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Limit Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 whitespace-nowrap">Show:</span>
          <select
            value={limitValue}
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            className="block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {limitOptions.map((option) => (
              <option key={option} value={option}>
                Top {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchValue || categoryValue) && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Active filters:</span>
          {searchValue && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{searchValue}"
              <button
                onClick={clearSearch}
                className="ml-1.5 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {categoryValue && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Category: {categoryValue}
              <button
                onClick={clearCategory}
                className="ml-1.5 text-green-600 hover:text-green-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterControls;