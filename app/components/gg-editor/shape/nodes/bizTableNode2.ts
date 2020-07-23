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
import { optimizeMultilineText } from '../utils';

const { ItemState } = constants;
// 窗口内边距
const WRAPPER_HORIZONTAL_PADDING = 4;
// 头部高度
const TABLE_HEAD_HEIGHT = 16;

const WRAPPER_CLASS_NAME = 'table-wrapper';
const TABLE_HEAD_CLASS_NAME = 'table-head';

interface BizTableNodeModel extends NodeModel {
  tableName: string;
  attrs: Array<{ name: string }>;
}

const bizNode: CustomNode = {
  options: {
    size: [120, 60],
    wrapperStyle: {
      radius: 5,
      lineWidth: 1,
      fill: '#1f2324',
      stroke: 'transparent'
    },
    headStyle: {
      fill: '#aaa',
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
          fill: '#242829',
          stroke: '#525657'
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
          WRAPPER_HORIZONTAL_PADDING * 2 +
          TABLE_HEAD_HEIGHT * (model.attrs.length + 1) +
          4,
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
        y: TABLE_HEAD_HEIGHT / 2 + WRAPPER_HORIZONTAL_PADDING,
        width,
        height: TABLE_HEAD_HEIGHT,
        ...headStyle
      }
    });

    return tableHeadLabel;
  },

  drawTableAttr(model: BizTableNodeModel, group: GGroup) {
    const [width] = this.getBoxSize(model);
    model.attrs.map((attr, index) => {
      const tableHead = group.addShape('text', {
        className: TABLE_HEAD_CLASS_NAME,
        draggable: true,
        attrs: {
          text: attr.name,
          x: WRAPPER_HORIZONTAL_PADDING,
          y:
            WRAPPER_HORIZONTAL_PADDING +
            TABLE_HEAD_HEIGHT +
            WRAPPER_HORIZONTAL_PADDING +
            TABLE_HEAD_HEIGHT * index +
            TABLE_HEAD_HEIGHT / 2,
          width: width - WRAPPER_HORIZONTAL_PADDING * 2,
          height: TABLE_HEAD_HEIGHT,
          fill: '#777',
          textBaseline: 'middle'
        }
      });
      return tableHead;
    });
  },

  setLabelText(model: NodeModel, group: GGroup) {
    const shape = group.findByClassName(TABLE_HEAD_CLASS_NAME);

    if (!shape) {
      return;
    }

    const [width] = this.getBoxSize(model);
    const { fontStyle, fontWeight, fontSize, fontFamily } = shape.attr();

    const text = model.label as string;
    const font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

    shape.attr(
      'text',
      optimizeMultilineText(
        text,
        font,
        2,
        width - WRAPPER_HORIZONTAL_PADDING * 2
      )
    );
  },

  update(model, item) {
    const group = item.getContainer();

    this.setLabelText(model, group);
  },

  setState(name, value, item) {
    const group = item.getContainer();
    const model = item.getModel();
    const states = item.getStates() as constants.ItemState[];

    [WRAPPER_CLASS_NAME, TABLE_HEAD_CLASS_NAME].forEach(className => {
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

  getBoxSize(model: NodeModel): number[] {
    const { size } = this.getOptions(model);

    if (!isArray(size)) {
      return [size, size];
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

G6.registerNode('bizTableNode2', bizNode);
