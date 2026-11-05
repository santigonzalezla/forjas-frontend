import {API_BASE_URL, CATALOG_SOURCE, CONTENT_SOURCE} from '@/lib/constants';
import {HttpClient} from '@/services/http/HttpClient';
import {CatalogService} from '@/services/catalog/CatalogService';
import {MockCatalogSource} from '@/services/catalog/MockCatalogSource';
import {ApiCatalogSource} from '@/services/catalog/ApiCatalogSource';
import {ContentService} from '@/services/content/ContentService';
import {MockContentSource} from '@/services/content/MockContentSource';
import {ApiContentSource} from '@/services/content/ApiContentSource';

const http = new HttpClient(API_BASE_URL);

export const catalogService = new CatalogService(
    CATALOG_SOURCE === 'api' ? new ApiCatalogSource(http) : new MockCatalogSource(),
);

export const contentService = new ContentService(
    CONTENT_SOURCE === 'api' ? new ApiContentSource(http) : new MockContentSource(),
);
