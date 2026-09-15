import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationApi } from '../api/notification-api';

const notificationSettingKey = (goodsId: number, storageId: number) => [
  'notifications',
  'setting',
  goodsId,
  storageId,
];

type UpdateNotificationSettingVariables = {
  enabled: boolean;
  goodsId: number;
  minQuantity: number;
  previouslyEnabled: boolean;
  storageId: number;
};

export const useNotificationSetting = (goodsId: number, storageId: number) => {
  const { data, ...query } = useQuery({
    queryKey: notificationSettingKey(goodsId, storageId),
    queryFn: () => notificationApi.getSetting(goodsId, storageId),
    retry: false,
  });

  return {
    ...query,
    data,
    setting: data ?? null,
  };
};

export const useUpdateNotificationSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enabled,
      goodsId,
      minQuantity,
      previouslyEnabled,
      storageId,
    }: UpdateNotificationSettingVariables) => {
      if (enabled) {
        return notificationApi.saveSetting({
          goods_id: goodsId,
          min_qty: minQuantity,
          storage_id: storageId,
        });
      }
      if (previouslyEnabled) return notificationApi.removeSetting(goodsId, storageId);
      return null;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: notificationSettingKey(variables.goodsId, variables.storageId),
      });
    },
  });
};
