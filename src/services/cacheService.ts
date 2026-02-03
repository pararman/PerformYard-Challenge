import { SearchQuery } from "../routes/search/GET";
import { type SearchResult } from "./searchService.js";

type CacheDictionary = Record<string, SearchResult[]>;

let cachedResults: CacheDictionary = {};
let dataVersion: number = 1;



/**
 * Uses a searchQuery to find if a value is in the cache or not
 * On a HIT, returns the searchResult that corresponds to the searchQuery
 * On a MISS, throws an error with message 'No cache value found'
 * 
 * @param SearchQuery the query that is passeed into the GET reuest
 * @returns The SearchResult object that is stored in the cache
 * @throws If the SearchResult does not exist in the cache
 */
export function getFromCache(query: string, sortRule?: string, isAscending?: string) {
    const cacheKey = `${query}${sortRule}${isAscending}`
    if (cachedResults[cacheKey]) {
        console.log('retrieved from cache');
        return cachedResults[cacheKey]
    }
    console.log('cache miss');
    throw new Error('No cache value found')
}

/**
 * Stores a query and a result in the cache
 */
export function storeInCache(searchResult: SearchResult[], query: string, sortRule?: string, isAscending?: string, ) {
    console.log('storing in cache');
    const cacheKey = `${query}${sortRule}${isAscending}`
    cachedResults[cacheKey] = searchResult
}

/**
 * Increments cache version and resets the CacheDirectory back to being empty
 */
export function incrementCacheVersion() {
    console.log('incrementing cache');
    dataVersion += 1;
    cachedResults = {};
}