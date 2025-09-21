import defaultClient, { apiClient as namedClient } from "../../client/lib/api-client";

export const apiClient = namedClient || defaultClient;
export default apiClient;
