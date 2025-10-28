/**
 * PageLoadingSkeleton Component
 *
 * A reusable loading skeleton component displayed during code-split page loading.
 * Provides visual feedback to users while page components are being loaded.
 * Matches the general layout structure of the application.
 */

import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";

export const PageLoadingSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-6 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded-md w-64" />
        <div className="h-4 bg-muted rounded-md w-96" />
      </div>

      {/* Stats Cards Row Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Card (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-64 mt-2" />
            </CardHeader>
            <CardContent>
              {/* Chart placeholder */}
              <div className="h-64 bg-muted rounded-lg" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-muted rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (1 column) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 pb-3 border-b last:border-0">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-40" />
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-muted rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Loading Indicator */}
      <div
        className="flex items-center justify-center py-8"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center space-x-2 text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm">Loading page...</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Compact Loading Skeleton
 * A minimal skeleton for smaller components or sidebar loading
 */
export const CompactLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      <div className="h-6 bg-muted rounded w-3/4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
};

/**
 * Table Loading Skeleton
 * Skeleton specifically for table/list views
 */
export const TableLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 pb-2 border-b">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 bg-muted rounded" />
        ))}
      </div>

      {/* Table Rows */}
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="grid grid-cols-4 gap-4 py-3 border-b">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-4 bg-muted rounded" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default PageLoadingSkeleton;
