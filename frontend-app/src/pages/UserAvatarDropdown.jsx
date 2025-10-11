import React, { useRef } from 'react';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';

export function UserAvatarDropdown() {
  const menu = useRef(null);

  const items = [
    {
      label: 'Profile',
      command: () => {
        console.log('Profile clicked');
        // Add profile logic here
      }
    },
    {
      label: 'Logout',
      command: () => {
        console.log('Logout clicked');
        // Add logout logic here, e.g., clear session, redirect
      }
    }
  ];

  return (
    <div className="flex align-items-center">
      <Avatar
        label="U"
        shape="circle"
        className="cursor-pointer"
        onClick={(event) => menu.current.toggle(event)}
      />
      <Menu model={items} popup ref={menu} />
    </div>
  );
}
