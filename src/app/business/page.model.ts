export interface Page<T> {
  content: T[];         // List of items (e.g., Business objects)
  totalElements: number; // Total number of elements across all pages
  totalPages: number;    // Total number of pages
  size: number;          // Number of items per page
  number: number;        // Current page number (zero-based)
}
