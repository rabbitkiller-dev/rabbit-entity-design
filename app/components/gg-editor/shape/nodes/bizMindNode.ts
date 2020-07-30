import G6 from '@antv/g6';
import merge from 'lodash/merge';
import { constants } from 'gg-editor';
import { GGroup, Node, NodeModel, CustomNode } from 'gg-editor/lib/common/interfaces';
import { getNodeSide, getFoldButtonPath, getUnfoldButtonPath, textMetrics } from '../utils';
import { BizTableNodeModel } from '../../../../interface';
import { ItemState } from '../../common/constants';

const WRAPPER_CLASS_NAME = 'node-wrapper';
export const FOLD_BUTTON_CLASS_NAME = 'node-fold-button';
export const UNFOLD_BUTTON_CLASS_NAME = 'node-unfold-button';

const bizMindNode: CustomNode = {
  options: {
    size: [120, 60],
    wrapperStyle: {
      radius: 8,
      fill: '#2e3b46',
      stroke: undefined,
      lineWidth: undefined,
    },
    headStyle: {
      fill: 'rgba(255, 255, 255, 0.65)',
      textAlign: 'center',
      textBaseline: 'middle'
    },

    labelStyle: {
      fill: '#fff',
      textAlign: 'center',
      textBaseline: 'middle',
    },
    stateStyles: {
      [ItemState.Active]: {
        wrapperStyle: {
          fill: '#3c4c56',
        },
        headStyle: {},
        labelStyle: {},
      } as any,
      [ItemState.Selected]: {
        wrapperStyle: {
          stroke: '#3c4c56',
          lineWidth: 2,
        },
        headStyle: {},
        labelStyle: {},
      } as any
    }
  },
  getOptions(model: NodeModel) {
    return merge({}, this.options, this.getCustomConfig(model) || {}, model);
  },
  afterDraw(model, group) {
    this.drawButton(model, group);
  },
  draw(model: NodeModel, group: GGroup) {
    const keyShape = this.drawWrapper(model, group);

    this.drawLabel(model, group);
    return keyShape;
  },
  drawWrapper(model: NodeModel, group: GGroup) {
    const textBox = textMetrics(model.label);
    const { wrapperStyle } = this.getOptions(model);
    const shape = group.addShape('rect', {
      className: WRAPPER_CLASS_NAME,
      draggable: true,
      attrs: {
        x: 0,
        y: 0,
        width: 12 + textBox.width + 12,
        height: 8 + textBox.height + 8,
        ...wrapperStyle,
      },
    });
    return shape;
  },
  drawLabel(model: NodeModel, group: GGroup) {
    const [width, height] = this.getSize(model);
    const textBox = textMetrics(model.label);
    const { labelStyle } = this.getOptions(model);

    const shape = group.addShape('text', {
      className: 'LABEL_CLASS_NAME',
      draggable: true,
      attrs: {
        x: (12 + textBox.width + 12) / 2,
        y: (8 + textBox.height + 8) / 2,
        text: model.label,
        ...labelStyle,
      },
    });

    return shape;
  },
  afterUpdate(model, item) {
    const group = item.getContainer();

    this.drawButton(model, group);
    this.adjustButton(model, item);
  },

  drawButton(model: NodeModel, group: GGroup) {
    const { children, collapsed } = model;

    [FOLD_BUTTON_CLASS_NAME, UNFOLD_BUTTON_CLASS_NAME].forEach(className => {
      const shape = group.findByClassName(className);

      if (shape) {
        shape.destroy();
      }
    });

    if (!children || !children.length) {
      return;
    }

    if (!collapsed) {
      group.addShape('path', {
        className: FOLD_BUTTON_CLASS_NAME,
        attrs: {
          path: getFoldButtonPath(),
          fill: '#ffffff',
          stroke: '#ccc1d8',
        },
      });
    } else {
      group.addShape('path', {
        className: UNFOLD_BUTTON_CLASS_NAME,
        attrs: {
          path: getUnfoldButtonPath(),
          fill: '#ffffff',
          stroke: '#ccc1d8',
        },
      });
    }
  },

  adjustButton(model: NodeModel, item: Node) {
    const { children, collapsed } = model;

    if (!children || !children.length) {
      return;
    }

    const group = item.getContainer();
    const shape = group.findByClassName(!collapsed ? FOLD_BUTTON_CLASS_NAME : UNFOLD_BUTTON_CLASS_NAME);

    const [width, height] = this.getSize(model);

    const x = getNodeSide(item) === 'left' ? -24 : width + 10;
    const y = height / 2 - 9;

    shape.translate(x, y);
  },

  getBoxSize(model: BizTableNodeModel): number[] {
    let { size } = this.getOptions(model);
    const fontStyle = { fontSize: '12px', fontFamily: 'sans-serif' };
    const fontMaxWidth = textMetrics(model.label, fontStyle).width;
    const fontMaxHeight = textMetrics(model.label, fontStyle).width;
    if (!Array.isArray(size)) {
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
  setState(name, value, item) {
    const group = item.getContainer();
    const model = item.getModel();
    const states = item.getStates() as ItemState[];

    [WRAPPER_CLASS_NAME].forEach(className => {
      const shape = group.findByClassName(className);
      const options = this.getOptions(model);

      const shapeName = className.split('-')[1];

      shape.attr({
        ...options[`${shapeName}Style`],
      });

      states.forEach(state => {
        if (options.stateStyles[state] && options.stateStyles[state][`${shapeName}Style`]) {
          shape.attr({
            ...options.stateStyles[state][`${shapeName}Style`],
          });
        }
      });
      if (states.length === 0 && options.stateStyles[`${shapeName}Style`]) {
        shape.attr({
          ...options.stateStyles[`${shapeName}Style`],
        });
      }
    });

    if (this.afterSetState) {
      this.afterSetState(name, value, item);
    }
  },
  getSize(model: NodeModel) {
    const { size } = this.getOptions(model);

    if (!Array.isArray(size)) {
      return [size, size];
    }

    return size;
  },
  getCustomConfig() {
    return {};
  },

  getAnchorPoints() {
    return [
      [0, 0.5],
      [1, 0.5],
    ];
  },
};

G6.registerNode('bizMindNode', bizMindNode);
