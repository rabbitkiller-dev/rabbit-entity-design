import G6 from '@antv/g6';
import merge from 'lodash/merge';
import isArray from 'lodash/isArray';
import {
  CustomNode,
  GGroup,
  Item,
  NodeModel
} from 'gg-editor/lib/common/interfaces';
import { setAnchorPointsState, constants } from 'gg-editor';
import { optimizeMultilineText, textMetrics } from '../utils';
import { BizTableNodeModel } from '../../../../interface';

const { ItemState } = constants;
// 窗口内边距
const WRAPPER_HORIZONTAL_PADDING = 20;
// 头部高度
const TABLE_HEAD_HEIGHT = 40;
// 头部高度
const TABLE_ATTR_HEIGHT = 20;

const WRAPPER_CLASS_NAME = 'table-wrapper';
const TABLE_HEAD_CLASS_NAME = 'table-head';


const bizNode: CustomNode = {
  options: {
    size: [120, 60],
    wrapperStyle: {
      radius: 5,
      lineWidth: 1,
      fill: '#24313c',
      stroke: 'transparent'
    },
    headStyle: {
      fill: 'rgba(255, 255, 255, 0.65)',
      textAlign: 'center',
      textBaseline: 'middle'
    },
    stateStyles: {
      [ItemState.Active]: {
        wrapperStyle: {},
        headStyle: {}
      } as any,
      [ItemState.Selected]: {
        wrapperStyle: {
          stroke: '#283540'
        },
        headStyle: {}
      } as any
    }
  },

  getOptions(model: NodeModel) {
    return merge({}, this.options, this.getCustomConfig(model) || {}, model);
  },

  draw(model, group) {
    const keyShape = this.drawWrapper(model, group);
    this.drawTableHead(model, group);
    this.drawTableAttr(model, group);
    return keyShape;
  },

  drawWrapper(model: BizTableNodeModel, group: GGroup) {
    const [width] = this.getBoxSize(model);
    const { wrapperStyle } = this.getOptions(model);

    const shape = group.addShape('rect', {
      className: WRAPPER_CLASS_NAME,
      draggable: true,
      attrs: {
        x: 0,
        y: 0,
        width,
        height:
          WRAPPER_HORIZONTAL_PADDING +
          WRAPPER_HORIZONTAL_PADDING +
          TABLE_HEAD_HEIGHT +
          TABLE_ATTR_HEIGHT * model.attrs.length,
        ...wrapperStyle
      }
    });

    return shape;
  },

  drawTableHead(model: NodeModel, group: GGroup) {
    const [width] = this.getBoxSize(model);
    const { headStyle } = this.getOptions(model);
    const tableHeadLabel = group.addShape('text', {
      className: TABLE_HEAD_CLASS_NAME,
      draggable: true,
      attrs: {
        text: model.tableName,
        x: width / 2,
        y: (TABLE_HEAD_HEIGHT / 2) + (WRAPPER_HORIZONTAL_PADDING / 2),
        width,
        height: TABLE_HEAD_HEIGHT,
        ...headStyle
      }
    });
    group.addShape('rect', {
      draggable: true,
      attrs: {
        x: WRAPPER_HORIZONTAL_PADDING,
        y: TABLE_HEAD_HEIGHT + (WRAPPER_HORIZONTAL_PADDING / 2),
        width: width - WRAPPER_HORIZONTAL_PADDING * 2,
        height: 1,
        fill: 'rgba(255, 255, 255, 0.65)',
      }
    });

    return tableHeadLabel;
  },

  drawTableAttr(model: BizTableNodeModel, group: GGroup) {
    const [width] = this.getBoxSize(model);
    const startY = TABLE_HEAD_HEIGHT + (WRAPPER_HORIZONTAL_PADDING / 2) + 10;
    model.attrs.map((attr, index) => {
      group.addShape('circle', {
        className: TABLE_HEAD_CLASS_NAME,
        draggable: true,
        attrs: {
          x: WRAPPER_HORIZONTAL_PADDING,
          y:
            startY +
            TABLE_ATTR_HEIGHT * index + TABLE_ATTR_HEIGHT / 2,
          r: 2,
          fill: 'rgba(255, 255, 255, 0.65)',
          textBaseline: 'middle'
        }
      });
      const tableHead = group.addShape('text', {
        className: TABLE_HEAD_CLASS_NAME,
        draggable: true,
        attrs: {
          text: attr.name,
          x: WRAPPER_HORIZONTAL_PADDING + 10,
          y:
            startY +
            TABLE_ATTR_HEIGHT * index + TABLE_ATTR_HEIGHT / 2,
          width: width - WRAPPER_HORIZONTAL_PADDING * 2,
          height: TABLE_HEAD_HEIGHT,
          fill: 'rgba(255, 255, 255, 0.65)',
          textBaseline: 'middle'
        }
      });
      return tableHead;
    });
  },

  setState(name, value, item) {
    const group = item.getContainer();
    const model = item.getModel();
    const states = item.getStates() as constants.ItemState[];

    [WRAPPER_CLASS_NAME].forEach(className => {
      const shape = group.findByClassName(className);
      const options = this.getOptions(model);

      const shapeName = className.split('-')[1];

      shape.attr({
        ...options[`${shapeName}Style`]
      });

      states.forEach(state => {
        if (
          options.stateStyles[state] &&
          options.stateStyles[state][`${shapeName}Style`]
        ) {
          shape.attr({
            ...options.stateStyles[state][`${shapeName}Style`]
          });
        }
      });
    });

    if (name === ItemState.Selected) {
      const wrapperShape = group.findByClassName(WRAPPER_CLASS_NAME);

      const [width, height] = this.getBoxSize(model);

      // if (value) {
      //   wrapperShape.attr({
      //     x: -WRAPPER_BORDER_WIDTH,
      //     y: -WRAPPER_BORDER_WIDTH * 2,
      //     width: width + WRAPPER_BORDER_WIDTH * 2,
      //     height: height + WRAPPER_BORDER_WIDTH * 3,
      //   });
      // } else {
      //   wrapperShape.attr({
      //     x: 0,
      //     y: -WRAPPER_BORDER_WIDTH * 2,
      //     width,
      //     height: height + WRAPPER_BORDER_WIDTH * 2,
      //   });
      // }
    }

    if (this.afterSetState) {
      this.afterSetState(name, value, item);
    }
  },

  getBoxSize(model: BizTableNodeModel): number[] {
    let { size } = this.getOptions(model);
    const fontStyle = { fontSize: '12px', fontFamily: 'sans-serif' };
    const fontMaxWidth = Math.max(
      textMetrics(model.tableName, fontStyle).width,
      ...model.attrs.map((attr) => textMetrics(attr.name, fontStyle).width)
    ) + WRAPPER_HORIZONTAL_PADDING * 2;
    if (!isArray(size)) {
      if (size < fontMaxWidth) {
        return [fontMaxWidth, fontMaxWidth];
      }
      return [size, size];
    }
    if (size[0] < fontMaxWidth) {
      return [fontMaxWidth, fontMaxWidth];
    }
    return size;
  },

  getCustomConfig() {
    return {};
  },
  afterSetState(name: string, value: string | boolean, item: Item) {
    setAnchorPointsState.call(this, name, value, item);
  },

  getAnchorPoints() {
    return [
      [0.5, 0],
      [0.5, 1],
      [0, 0.5],
      [1, 0.5]
    ];
  }
};

G6.registerNode('bizTableNode', bizNode);
