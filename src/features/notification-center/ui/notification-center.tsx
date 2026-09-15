import { Button, Drawer, Loader, OutlineSystemBell, SegmentedControl, Typography } from 'alif-ui';

import { formatDate } from '@shared/lib';

import { useNotificationCenter } from '../model/use-notification-center';

export const NotificationCenter = () => {
  const {
    clearRead,
    close,
    fetchNextPage,
    hasNextPage,
    isAllowed,
    isClearingRead,
    isFetchingNextPage,
    isLoading,
    isMarkingAllRead,
    isOpen,
    items,
    markAllRead,
    open,
    openNotification,
    setUnreadOnly,
    unreadCount,
    unreadOnly,
  } = useNotificationCenter();

  if (!isAllowed) return null;

  return (
    <>
      <button
        type="button"
        className="relative mx-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-(--color-icon-primary) hover:bg-(--color-bg-neutral-subtle) [&>svg]:h-6! [&>svg]:w-6!"
        aria-label={`Уведомления${unreadCount ? `, непрочитанных: ${unreadCount}` : ''}`}
        onClick={open}
      >
        <OutlineSystemBell />
        {unreadCount > 0 && (
          <div className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] leading-none font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      <Drawer
        title="Уведомления"
        subTitle={`${unreadCount} непрочитанных`}
        position="right"
        width="440px"
        isOpen={isOpen}
        onClose={close}
        isCloseOutside
      >
        <div className="flex h-full min-h-0 flex-col gap-4">
          <SegmentedControl
            tabs={[
              { label: 'Все', value: 'all' },
              { label: 'Непрочитанные', value: 'unread' },
            ]}
            value={unreadOnly ? 'unread' : 'all'}
            onChange={(value) => setUnreadOnly(value === 'unread')}
            rounded
            size="m"
            variant="accent"
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="s"
              variant="outline-neutral"
              disabled={!unreadCount || isMarkingAllRead}
              onClick={markAllRead}
            >
              Прочитать все
            </Button>
            <Button
              type="button"
              size="s"
              variant="outline-neutral"
              disabled={isClearingRead}
              onClick={clearRead}
            >
              Очистить прочитанные
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader />
              </div>
            ) : items.length === 0 ? (
              <Typography
                category="body"
                proportions="s"
                className="py-10 text-center text-(--color-text-muted)"
              >
                Уведомлений пока нет
              </Typography>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`flex w-full gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-(--color-bg-neutral-subtle) ${item.is_read ? 'border-(--color-border-default)' : 'border-red-200 bg-red-50/60'}`}
                    onClick={() => openNotification(item)}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.is_read ? 'bg-gray-300' : 'bg-red-600'}`}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm text-(--color-text-body)">{item.message}</span>
                      <span className="mt-1 block text-xs text-(--color-text-muted)">
                        {formatDate(item.created_at, 'ru', { withTime: true })}
                      </span>
                    </span>
                  </button>
                ))}
                {hasNextPage && (
                  <Button
                    type="button"
                    variant="outline-neutral"
                    isLoading={isFetchingNextPage}
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                  >
                    Показать ещё
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};
