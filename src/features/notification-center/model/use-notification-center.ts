import { useState } from 'react';
import { snackbar } from 'alif-ui';
import { useNavigate } from 'react-router-dom';

import {
  type NotificationItem,
  useNotificationActions,
  useNotificationCount,
  useNotifications,
} from '@entities/notification';
import { routes } from '@shared/config';

export const useNotificationCenter = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const countQuery = useNotificationCount();
  const notificationsQuery = useNotifications(unreadOnly, isOpen && countQuery.isAllowed);
  const actions = useNotificationActions();

  const navigateToNotification = (item: NotificationItem) => {
    const goodsId = Number(item.payload?.goods_id ?? item.entity_id);
    const storageId = Number(item.payload?.storage_id ?? item.storage_id);
    const categoryId = Number(item.payload?.cat_id);
    if (!goodsId || !storageId || !categoryId) return;

    setIsOpen(false);
    navigate(
      routes.inventoryGoodsDetails
        .replace(':storageId', String(storageId))
        .replace(':catId', String(categoryId))
        .replace(':goodId', String(goodsId)),
    );
  };

  const openNotification = (item: NotificationItem) => {
    if (item.is_read) {
      navigateToNotification(item);
      return;
    }
    actions.markRead.mutate([item.id], {
      onSuccess: () => navigateToNotification(item),
    });
  };

  const clearRead = () => {
    actions.clearRead.mutate(undefined, {
      onSuccess: () => snackbar.show({ title: 'Прочитанные уведомления очищены', type: 'success' }),
    });
  };

  return {
    clearRead,
    close: () => setIsOpen(false),
    fetchNextPage: notificationsQuery.fetchNextPage,
    hasNextPage: notificationsQuery.hasNextPage,
    isAllowed: countQuery.isAllowed,
    isClearingRead: actions.clearRead.isPending,
    isFetchingNextPage: notificationsQuery.isFetchingNextPage,
    isLoading: notificationsQuery.isLoading,
    isMarkingAllRead: actions.markAllRead.isPending,
    isOpen,
    items: notificationsQuery.items,
    markAllRead: () => actions.markAllRead.mutate(),
    open: () => setIsOpen(true),
    openNotification,
    setUnreadOnly,
    unreadCount: notificationsQuery.unreadCount ?? countQuery.unreadCount,
    unreadOnly,
  };
};
