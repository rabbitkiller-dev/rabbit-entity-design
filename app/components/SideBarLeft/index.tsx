import React from 'react';
import ReactDOM from 'react-dom';
import { Modal } from 'antd';
import {
  FolderOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { getProject } from '../../features/project';
import styles from './SideBarLeft.less';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes.json';

interface SideBarLeftProps {
}

interface SideBarLeftState {
  visible: boolean;
}

export class SideBarLeft extends React.Component<SideBarLeftProps, SideBarLeftState> {
  constructor(props: Readonly<SideBarLeftProps>) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  async componentDidMount() {
    const projects = await getProject();
    console.log(projects);
  }

  render() {
    return (
      <div className={styles.SideBarLeft}>
        <div className={styles.logo}>
          <SmileOutlined />
        </div>
        <div className={styles.item}>
          <Link to={routes.EDITOR}>
            <FolderOutlined />
          </Link>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.item}>
          <Link to={routes.COUNTER}>
            <FolderOutlined />
          </Link>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.item}></div>
      </div>
    );
  }
}
