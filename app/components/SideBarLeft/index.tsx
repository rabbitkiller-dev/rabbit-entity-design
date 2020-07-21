import React from 'react';
import ReactDOM from 'react-dom';
import { Modal } from 'antd';
import {
  FolderOutlined,
  SmileOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { getProject } from '../../features/project';
import styles from './SideBarLeft.less';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes.json';

interface SideBarLeftProps {
  showType: 'file_panel' | 'drag_panel',

  onShowTypeChange?(type: 'file_panel' | 'drag_panel'): void;
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
  }

  showTypeChange(type) {
    this.props.onShowTypeChange && this.props.onShowTypeChange(type);
  }

  render() {
    return (
      <div className={styles.SideBarLeft}>
        <div className={styles.logo}>
          <SmileOutlined/>
        </div>
        <div className={styles.item}>
          <a onClick={this.showTypeChange.bind(this, 'file_panel')}
             style={{ color: this.props.showType === 'file_panel' ? '#fff' : '' }}>
            <FolderOutlined/>
          </a>
        </div>
        <div className={styles.item}>
          <a onClick={this.showTypeChange.bind(this, 'drag_panel')}
             style={{ color: this.props.showType === 'drag_panel' ? '#fff' : '' }}>
            <FolderOutlined/>
          </a>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.item}>
          <a>
            <SettingOutlined />
          </a>
        </div>
      </div>
    );
  }
}
