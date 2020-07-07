import React from 'react';
import {Observable, ReplaySubject, Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import { RaDesignTreeService } from './ra-design-tree.service';
import { TreeNodeModel as NzTreeNode } from './tree-node.model';
import { TreeNode } from './TreeNode';
import { NzFormatEmitEvent } from './interface';

const treeService: RaDesignTreeService = new RaDesignTreeService();

interface TreeProps {
  className?: string;
  nzMultiple?: boolean;
  nzCheckStrictly?: boolean;
  nzShowLine?: boolean;
  data: any[];
  nzClick?($event: NzFormatEmitEvent): void;
  nzDblClick?($event: NzFormatEmitEvent): void;
}

interface TreeState {
  nzNodes: NzTreeNode[];
  classMap?: string;
}

/**
 * Coerces a value({@link any[]}) to a TreeNodes({@link NzTreeNode[]})
 */
function coerceTreeNodes(value: any[]): NzTreeNode[] {
  let nodes: NzTreeNode[] = [];
  if (!treeService.isArrayOfNzTreeNode(value)) {
    // has not been new NzTreeNode
    nodes = value.map(item => new NzTreeNode(item, undefined, treeService));
  } else {
    nodes = value.map((item: NzTreeNode) => {
      item.service = treeService;
      return item;
    });
  }
  return nodes;
}

export class Tree extends React.Component<TreeProps, TreeState> {
  initFirst: boolean = false;
  state: TreeState = {
    nzNodes: [],
  };
  destroy$ = new Subject();
  prefixCls = 'ra-design-tree';
  classMap = {};

  constructor(props: Readonly<TreeProps>) {
    super(props);
    if (props.data) {
      this.initNzData(props.data);
      this.state.nzNodes = treeService.rootNodes;
    }
    this.setClassMap();
    treeService
      .eventTriggerChanged()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        switch (data.eventName) {
          case 'expand':
            // this.nzExpandChange.emit(data);
            break;
          case 'click':
            // this.nzClick.emit(data);
            props.nzClick && props.nzClick(data);
            break;
          case 'check':
            // this.nzCheckBoxChange.emit(data);
            break;
          case 'dblclick':
            props.nzDblClick && props.nzDblClick(data);
            break;
          case 'contextmenu':
            // this.nzContextMenu.emit(data);
            break;
          // drag drop
          case 'dragstart':
            // this.nzOnDragStart.emit(data);
            break;
          case 'dragenter':
            // this.nzOnDragEnter.emit(data);
            break;
          case 'dragover':
            // this.nzOnDragOver.emit(data);
            break;
          case 'dragleave':
            // this.nzOnDragLeave.emit(data);
            break;
          case 'drop':
            // this.nzOnDrop.emit(data);
            break;
          case 'dragend':
            // this.nzOnDragEnd.emit(data);
            break;
        }
      });
    this.initFirst = true;
  }

  componentWillReceiveProps(nextProps: Readonly<TreeProps>) {
    if (this.props.data !== nextProps.data) {
      this.initNzData(nextProps.data);
      this.setState({ nzNodes: treeService.rootNodes });
    }
    this.setClassMap();
  }

  initNzData(value: any[]): void {
    if (Array.isArray(value)) {
      treeService.isCheckStrictly = !!this.props.nzCheckStrictly;
      treeService.isMultiple = !!this.props.nzMultiple;
      treeService.initTree(coerceTreeNodes(value));
    }
  }

  setClassMap(): void {
    this.classMap = {
      [this.prefixCls]: true,
      [this.prefixCls + '-show-line']: this.props.nzShowLine,
      // [`${this.prefixCls}-icon-hide`]: !this.nzShowIcon,
      // [`${this.prefixCls}-block-node`]: this.nzBlockNode,
      // ['draggable-tree']: this.nzDraggable,
      // ['ant-select-tree']: this.nzSelectMode
    };
    if (this.initFirst) {
      this.setState({ classMap: this.classMapIntoString(this.classMap) });
    } else {
      // @ts-ignore
      this.state.classMap = this.classMapIntoString(this.classMap);
    }
  }

  classMapIntoString(classMap: { [index: string]: boolean }): string {
    return Object.keys(classMap).filter((key) => classMap[key]).join(' ');
  }

  render() {
    const children = this.state.nzNodes.map((node) => {
      return (
        <TreeNode key={node.key} nzTreeNode={node} nzTreeService={treeService}/>
      );
    });
    return (
      <ul
        role="tree"
        unselectable="on"
        className={this.state.classMap + ' ' + this.props.className}>
        {children}
      </ul>
    );
  }
}

