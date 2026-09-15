import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationApi } from '../api/notification-api';

const NOTIFICATION_POLL_INTERVAL = 45_000;
const NOTIFICATION_PAGE_SIZE = 20;

const notificationKeys = {
  count: ['notifications', 'count'] as const,
  list: ['notifications', 'list'] as const,
};

export const useNotificationCount = () => {
  const { data, isSuccess, ...query } = useQuery({
    queryKey: notificationKeys.count,
    queryFn: notificationApi.getCount,
    refetchInterval: NOTIFICATION_POLL_INTERVAL,
    retry: false,
  });

  return {
    ...query,
    data,
    isAllowed: isSuccess,
    isSuccess,
    unreadCount: data?.unread_count ?? 0,
  };
};

export const useNotifications = (onlyUnread: boolean, enabled: boolean) => {
  const { data, ...query } = useInfiniteQuery({
    queryKey: [...notificationKeys.list, onlyUnread],
    queryFn: ({ pageParam }) =>
      notificationApi.getList({
        limit: NOTIFICATION_PAGE_SIZE,
        only_unread: onlyUnread || undefined,
        page: pageParam,
      }),
    enabled,
    getNextPageParam: (lastPage) => {
      const { page, total_pages: totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    retry: false,
  });
  const pages = data?.pages ?? [];
  const latestPayload = pages.at(-1);

  return {
    ...query,
    data,
    items: pages.flatMap((page) => page.data),
    unreadCount: latestPayload?.unread_count,
  };
};

export const useNotificationActions = () => {
  const queryClient = useQueryClient();
  const refreshNotifications = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: notificationKeys.count }),
      queryClient.invalidateQueries({ queryKey: notificationKeys.list }),
    ]);
  };

  const { isPending: isMarkingAllRead, mutate: markAllRead } = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: refreshNotifications,
  });
  const { isPending: isClearingRead, mutate: clearRead } = useMutation({
    mutationFn: notificationApi.hideRead,
    onSuccess: refreshNotifications,
  });
  const { mutate: markRead } = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: refreshNotifications,
  });

  return {
    clearRead,
    isClearingRead,
    isMarkingAllRead,
    markAllRead,
    markRead,
  };
};
