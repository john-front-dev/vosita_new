import { httpClient } from '@shared/api';

import type {
  NotificationListParams,
  NotificationListPayload,
  NotificationSetting,
} from '../model/types';

const silentConfig = { headers: { 'x-skip-error-snackbar': 'true' } };

const getPayload = <T>(response: ApiResponse<T>) => {
  if (response.code !== 200) {
    throw new Error(response.message ?? 'Не удалось выполнить запрос уведомлений');
  }
  return response.payload;
};

export const notificationEndpoints = {
  count: '/notifications/count',
  hide: '/notifications/hide',
  list: '/notifications',
  read: '/notifications/read',
  setting: (goodsId: number | string) => `/tmz/notification_settings/${goodsId}`,
  settings: '/tmz/notification_settings',
} as const;

export const notificationApi = {
  getCount: () =>
    httpClient
      .get<ApiResponse<{ unread_count: number }>>(notificationEndpoints.count, silentConfig)
      .then((response) => getPayload(response.data)),
  getList: (params: NotificationListParams) =>
    httpClient
      .get<ApiResponse<NotificationListPayload>>(notificationEndpoints.list, {
        ...silentConfig,
        params,
      })
      .then((response) => getPayload(response.data)),
  getSetting: (goodsId: number, storageId: number) =>
    httpClient
      .get<ApiResponse<NotificationSetting>>(notificationEndpoints.setting(goodsId), {
        ...silentConfig,
        params: { storage_id: storageId },
      })
      .then((response) => getPayload(response.data)),
  hideRead: () =>
    httpClient
      .put<ApiResponse<{ hidden: number }>>(notificationEndpoints.hide, { all: true })
      .then((response) => getPayload(response.data)),
  markAllRead: () =>
    httpClient
      .put<ApiResponse<{ updated: number }>>(notificationEndpoints.read, { all: true })
      .then((response) => getPayload(response.data)),
  markRead: (ids: number[]) =>
    httpClient
      .put<ApiResponse<{ updated: number }>>(notificationEndpoints.read, { ides: ids })
      .then((response) => getPayload(response.data)),
  removeSetting: (goodsId: number, storageId: number) =>
    httpClient
      .delete<ApiResponse<null>>(notificationEndpoints.setting(goodsId), {
        params: { storage_id: storageId },
      })
      .then((response) => getPayload(response.data)),
  saveSetting: (body: { goods_id: number; min_qty: number; storage_id: number }) =>
    httpClient
      .post<ApiResponse<NotificationSetting>>(notificationEndpoints.settings, body)
      .then((response) => getPayload(response.data)),
};
