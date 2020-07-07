import React from 'react';
import {
  CaretDownOutlined,
  FileFilled,
} from '@ant-design/icons';
import { Transition } from 'react-transition-group';

import { TreeNodeModel as NzTreeNode } from './tree-node.model';
import { RaDesignTreeService } from './ra-design-tree.service';

interface TreeNodeProps {
  nzTreeService: RaDesignTreeService;
  nzTreeNode: NzTreeNode;
  nzShowLine?: boolean;
  nzSelectMode?: boolean;
  nzAsyncData?: boolean;
}

interface TreeNodeState {
  nzNodeClass?: string;
  nzNodeSwitcherClass?: string;
  nzNodeContentClass?: string;
  nzNodeContentLoadingClass?: string;
}

export class TreeNode extends React.Component<TreeNodeProps, TreeNodeState> {
  initFirst: boolean = false;
  nzTreeService: RaDesignTreeService;
  // default var
  prefixCls = 'ra-design-tree';
  nzTreeNode: NzTreeNode;
  nzNodeClass = {};
  nzNodeSwitcherClass = {};
  nzNodeContentClass = {};
  nzNodeCheckboxClass = {};
  nzNodeContentIconClass = {};
  nzNodeContentLoadingClass = {};

  get isShowSwitchIcon(): boolean {
    return !this.nzTreeNode.isLeaf && !this.props.nzShowLine;
  }

  get isSwitcherOpen(): boolean {
    return this.nzTreeNode.isExpanded && !this.nzTreeNode.isLeaf;
  }

  get isSwitcherClose(): boolean {
    return !this.nzTreeNode.isExpanded && !this.nzTreeNode.isLeaf;
  }

  constructor(props: Readonly<TreeNodeProps>) {
    super(props);
    this.state = {};
    this.nzTreeNode = props.nzTreeNode;
    this.nzTreeNode.component = this;
    this.nzTreeService = props.nzTreeService;
    this.setClassMap();
    this.initFirst = true;
  }


  /**
   * reset node class
   */
  setClassMap(): void {
    this.prefixCls = this.props.nzSelectMode ? 'ant-select-tree' : 'ra-design-tree';
    this.nzNodeClass = {
      [`${this.prefixCls}-treenode-disabled`]: this.nzTreeNode.isDisabled,
      [`${this.prefixCls}-treenode-switcher-open`]: this.isSwitcherOpen,
      [`${this.prefixCls}-treenode-switcher-close`]: this.isSwitcherClose,
      [`${this.prefixCls}-treenode-checkbox-checked`]: this.nzTreeNode.isChecked,
      [`${this.prefixCls}-treenode-checkbox-indeterminate`]: this.nzTreeNode.isHalfChecked,
      [`${this.prefixCls}-treenode-selected`]: this.nzTreeNode.isSelected,
      [`${this.prefixCls}-treenode-loading`]: this.nzTreeNode.isLoading
    };
    this.nzNodeSwitcherClass = {
      [`${this.prefixCls}-switcher`]: true,
      [`${this.prefixCls}-switcher-noop`]: this.nzTreeNode.isLeaf,
      [`${this.prefixCls}-switcher_open`]: this.isSwitcherOpen,
      [`${this.prefixCls}-switcher_close`]: this.isSwitcherClose
    };

    // this.nzNodeCheckboxClass = {
    //   [`${this.prefixCls}-checkbox`]: true,
    //   [`${this.prefixCls}-checkbox-checked`]: this.nzTreeNode.isChecked,
    //   [`${this.prefixCls}-checkbox-indeterminate`]: this.nzTreeNode.isHalfChecked,
    //   [`${this.prefixCls}-checkbox-disabled`]: this.nzTreeNode.isDisabled || this.nzTreeNode.isDisableCheckbox
    // };
    //
    this.nzNodeContentClass = {
      [`${this.prefixCls}-node-content-wrapper`]: true,
      [`${this.prefixCls}-node-content-wrapper-open`]: this.isSwitcherOpen,
      [`${this.prefixCls}-node-content-wrapper-close`]: this.isSwitcherClose,
      [`${this.prefixCls}-node-selected`]: this.nzTreeNode.isSelected
    };
    // this.nzNodeContentIconClass = {
    //   [`${this.prefixCls}-iconEle`]: true,
    //   [`${this.prefixCls}-icon__customize`]: true
    // };
    this.nzNodeContentLoadingClass = {
      [`${this.prefixCls}-iconEle`]: true,
      [`${this.prefixCls}-icon__open`]: this.isSwitcherOpen,
      [`${this.prefixCls}-icon__close`]: this.isSwitcherClose,
      [`${this.prefixCls}-icon_loading`]: this.nzTreeNode.isLoading,
    };
    if (this.initFirst) {
      this.setState({ nzNodeClass: this.classMapIntoString(this.nzNodeClass) });
      this.setState({ nzNodeSwitcherClass: this.classMapIntoString(this.nzNodeSwitcherClass) });
      this.setState({ nzNodeContentClass: this.classMapIntoString(this.nzNodeContentClass) });
      this.setState({ nzNodeContentLoadingClass: this.classMapIntoString(this.nzNodeContentLoadingClass) });
    } else {
      // @ts-ignore
      this.state.nzNodeClass = this.classMapIntoString(this.nzNodeClass);
      // @ts-ignore
      this.state.nzNodeSwitcherClass = this.classMapIntoString(this.nzNodeSwitcherClass);
      // @ts-ignore
      this.state.nzNodeContentClass = this.classMapIntoString(this.nzNodeContentClass);
      // @ts-ignore
      this.state.nzNodeContentLoadingClass = this.classMapIntoString(this.nzNodeContentLoadingClass);
    }
  }

  classMapIntoString(classMap: { [index: string]: boolean }): string {
    return Object.keys(classMap).filter((key) => classMap[key]).join(' ');
  }
  nzClick(event: MouseEvent): void {
    // event.preventDefault();
    event.stopPropagation();
    if (this.nzTreeNode.isSelectable && !this.nzTreeNode.isDisabled) {
      this.nzTreeNode.isSelected = true;
    }
    const eventNext = this.nzTreeService.formatEvent('click', this.nzTreeNode, event);
    this.nzTreeService!.triggerEventChange$!.next(eventNext);
  }
  nzDblClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const eventNext = this.nzTreeService.formatEvent('dblclick', this.nzTreeNode, event);
    this.nzTreeService!.triggerEventChange$!.next(eventNext);
  }
  /**
   * collapse node
   * @param event
   */
  _clickExpand(event: MouseEvent): void {
    if (!this.nzTreeNode.isLoading && !this.nzTreeNode.isLeaf) {
      event.preventDefault();
      event.stopPropagation();
      // set async state
      if (this.props.nzAsyncData && this.nzTreeNode.children.length === 0 && !this.nzTreeNode.isExpanded) {
        this.nzTreeNode.isLoading = true;
      }
      this.nzTreeNode.isExpanded = !this.nzTreeNode.isExpanded;
      if (this.nzTreeNode.isMatched) {
        this.setDisplayForParentNodes(this.nzTreeNode);
      }
      this.setDisplayForChildNodes(this.nzTreeNode);
      const eventNext = this.nzTreeService.formatEvent('expand', this.nzTreeNode, event);
      this.nzTreeService!.triggerEventChange$!.next(eventNext);
    }
  }

  private setDisplayForParentNodes(targetNode: NzTreeNode): void {
    const parentNode = targetNode.getParentNode();
    if (parentNode) {
      parentNode.canHide = false;
      this.setDisplayForParentNodes(parentNode);
    }
  }

  private setDisplayForChildNodes(parentNode: NzTreeNode): void {
    const { children } = parentNode;
    if (children.length > 0) {
      children.map(node => {
        const canHide = !node.isMatched;
        node.canHide = canHide;
        this.setDisplayForChildNodes(node);
      });
    }
  }

  render() {
    const liStyle = {
      paddingLeft: this.nzTreeNode.level * 18 + 'px',
    };
    const duration = 150;
    const defaultStyle = {
      transition: `height ${duration}ms ease-in-out`,
      transformOrigin: 'center top',
    };
    const transitionStyles = {
      entering: { height: '100%' },
      entered: { height: '100%' },
      exiting: { height: '0', overflow: 'hidden' },
      exited: { height: '0', overflow: 'hidden' },
    };
    const children = this.props.nzTreeNode.children.map((node) => {
      return (
        <TreeNode key={node.key} nzTreeNode={node} nzTreeService={this.nzTreeService}/>
      );
    });

    return (
      <span onMouseDown={this.nzClick.bind(this)} onDoubleClick={this.nzDblClick.bind(this)}>
        <li
          role="treeitem"
          style={liStyle}
          className={this.state.nzNodeClass}>
          <span
            className={this.state.nzNodeSwitcherClass}
            onTouchStart={this._clickExpand.bind(this)}
            onMouseDown={this._clickExpand.bind(this)}>
            {this.isShowSwitchIcon && <i
              className={this.props.nzSelectMode ? 'ra-design-tree-select-switcher-icon' : 'ra-design-tree-switcher-icon'}>
              <CaretDownOutlined/>
            </i>}
          </span>
          <span title={this.nzTreeNode.title} className={this.state.nzNodeContentClass}>
            <span className={this.state.nzNodeContentLoadingClass}>
              <FileFilled/>
            </span>
            <span className="ra-design-tree-title">{this.nzTreeNode.title}</span>
          </span>
        </li>
        <Transition in={this.nzTreeNode.isExpanded} timeout={duration}>
          {state => (
            <ul role="group"
                className="ant-tree-child-tree"
                data-expanded="true"
                style={{
                  ...defaultStyle,
                  ...transitionStyles[state],
                }}>
              {children}
            </ul>
          )}
        </Transition>
      </span>
    );
  }
}

