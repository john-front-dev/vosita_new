import {
  Avatar,
  Menu,
  OutlineSystemLock,
  OutlineSystemMoreVertical,
  OutlineSystemOut,
  Sidebar as AlifSidebar,
  Typography,
} from 'alif-ui';
import type { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { routes } from '@shared/config';
import { AlifIcon } from '@shared/icons';
import { canAccess, clearAuthSession, getStoredAccesses, getStoredUser } from '@shared/lib';

import { sidebarNavigation, type SidebarNavItem } from '../model/navigation';

const LogoFull = () => {
  return (
    <div className="flex items-center gap-3 pl-4">
      <AlifIcon className="h-7 w-7 text-(--brand-value-default)" />
      <Typography
        category="display"
        proportions="sStrong"
        className="text-[20px]! text-(--brand-value-default)!"
      >
        VOSITA
      </Typography>
    </div>
  );
};

type NavigableCollapseProps = {
  item: SidebarNavItem;
  isChildActive: (item: SidebarNavItem) => boolean;
  onNavigate: (path: string) => void;
};

const NavigableCollapse = ({ item, isChildActive, onNavigate }: NavigableCollapseProps) => {
  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    const header = event.currentTarget.querySelector<HTMLElement>('[class*="_collapseButton_"]');
    if (!header?.contains(event.target as Node)) return;

    const arrow = header.lastElementChild;
    if (arrow?.contains(event.target as Node)) return;

    event.stopPropagation();
    onNavigate(item.path);
  };

  return (
    <div className="sidebar-collapse" onClickCapture={handleClickCapture}>
      <AlifSidebar.Collapse icon={item.icon} label={item.title}>
        {item.children?.map((child) => (
          <AlifSidebar.Item
            key={child.path}
            icon={child.icon}
            path={child.path}
            active={isChildActive(child)}
            onClick={onNavigate}
          >
            {child.title}
          </AlifSidebar.Item>
        ))}
      </AlifSidebar.Collapse>
    </div>
  );
};

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
  const accesses = getStoredAccesses();
  const userName = user?.full_name.trim().split(/\s+/).filter(Boolean) ?? [];
  const initials =
    userName.length > 1
      ? `${userName[0].charAt(0)}${userName[1].charAt(0)}`
      : userName[0]?.slice(0, 2) || '';

  const isActive = (item: Pick<SidebarNavItem, 'path'>) =>
    location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

  const goToPath = (path: string) => {
    navigate(path);
  };

  const allowedNavigation = sidebarNavigation
    .filter((item) => canAccess(user, accesses, item.access))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => canAccess(user, accesses, child.access)),
    }))
    .filter((item) => !item.children || item.children.length > 0);

  const changePassword = () => {
    navigate(routes.changePassword);
  };

  const logout = () => {
    clearAuthSession();
    navigate(routes.login, { replace: true });
  };

  return (
    <AlifSidebar
      className="fixed inset-y-0 left-0 z-20"
      showControlButton
      variant="default"
      size="large"
      hideScrollbar={false}
    >
      <AlifSidebar.HeaderSection
        logo={{
          compact: <AlifIcon className="h-7 w-7 text-(--brand-value-default)" />,
          default: <LogoFull />,
        }}
      />

      <AlifSidebar.Items>
        {allowedNavigation.map((item) =>
          item.children?.length ? (
            item.title === 'Больше' ? (
              <div key={item.path} className="sidebar-collapse">
                <AlifSidebar.Collapse icon={item.icon} label={item.title}>
                  {item.children.map((child) => (
                    <AlifSidebar.Item
                      key={child.path}
                      icon={child.icon}
                      path={child.path}
                      active={isActive(child)}
                      onClick={goToPath}
                    >
                      {child.title}
                    </AlifSidebar.Item>
                  ))}
                </AlifSidebar.Collapse>
              </div>
            ) : (
              <NavigableCollapse
                key={item.path}
                item={item}
                isChildActive={isActive}
                onNavigate={goToPath}
              />
            )
          ) : (
            <AlifSidebar.Item
              key={item.path}
              icon={item.icon}
              path={item.path}
              active={isActive(item)}
              onClick={goToPath}
            >
              {item.title}
            </AlifSidebar.Item>
          ),
        )}
      </AlifSidebar.Items>

      <AlifSidebar.BottomSection>
        <AlifSidebar.Element icon={<Avatar size="m" placeholderContent={initials} />}>
          <div className="mt-3 flex items-center justify-between gap-2 rounded-3xl p-4">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar size="m" placeholderContent={initials} />
              <div className="flex min-w-0 flex-col leading-tight">
                <Typography category="body" proportions="s" className="w-37.5 truncate">
                  {user?.full_name}
                </Typography>
                <Typography category="body" proportions="s" className="w-37.5 truncate opacity-60">
                  {user?.email}
                </Typography>
              </div>
            </div>
            <Menu
              trigger={<OutlineSystemMoreVertical fill="currentColor" width="24" height="24" />}
            >
              <Menu.Item onClick={changePassword} leftIcon={<OutlineSystemLock />}>
                Изменить пароль
              </Menu.Item>
              <Menu.Item onClick={logout} leftIcon={<OutlineSystemOut />}>
                Выйти
              </Menu.Item>
            </Menu>
          </div>
        </AlifSidebar.Element>
      </AlifSidebar.BottomSection>
    </AlifSidebar>
  );
};
