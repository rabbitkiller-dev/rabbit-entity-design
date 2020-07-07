import React from 'react';
import styles from './HomePage.less';
import { SideBarLeft } from '../components/SideBarLeft';

export default function HomePage(props: any) {
  return (
    <div className={styles.main}>
      <SideBarLeft />
      {props.children}
    </div>
  );
}
