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
  const { isAllowed, unreadCount: totalUnreadCount } = useNotificationCount();
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    items,
    unreadCount,
  } = useNotifications(unreadOnly, isOpen && isAllowed);
  const {
    clearRead: clearReadNotifications,
    isClearingRead,
    isMarkingAllRead,
    markAllRead,
    markRead,
  } = useNotificationActions();

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
    markRead([item.id], {
      onSuccess: () => navigateToNotification(item),
    });
  };

  const clearRead = () => {
    clearReadNotifications(undefined, {
      onSuccess: () => snackbar.show({ title: 'Прочитанные уведомления очищены', type: 'success' }),
    });
  };

  return {
    clearRead,
    close: () => setIsOpen(false),
    fetchNextPage,
    hasNextPage,
    isAllowed,
    isClearingRead,
    isFetchingNextPage,
    isLoading,
    isMarkingAllRead,
    isOpen,
    items,
    markAllRead: () => markAllRead(),
    open: () => setIsOpen(true),
    openNotification,
    setUnreadOnly,
    unreadCount: unreadCount ?? totalUnreadCount,
    unreadOnly,
  };
};
