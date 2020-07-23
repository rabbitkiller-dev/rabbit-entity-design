import G6 from '@antv/g6';
const collapseIcon = (x, y, r) => {
  return [
    ['M', x - r, y],
    ['a', r, r, 0, 1, 0, r * 2, 0],
    ['a', r, r, 0, 1, 0, -r * 2, 0],
    ['M', x - r + 4, y],
    ['L', x - r + 2 * r - 4, y],
  ];
};
const expandIcon = (x, y, r) => {
  return [
    ['M', x - r, y],
    ['a', r, r, 0, 1, 0, r * 2, 0],
    ['a', r, r, 0, 1, 0, -r * 2, 0],
    ['M', x - r + 4, y],
    ['L', x - r + 2 * r - 4, y],
    ['M', x - r + r, y - r + 4],
    ['L', x, y + r - 4],
  ];
};
G6.registerCombo('cCircle', {
  drawShape: function draw(cfg, group) {
    const self = this;
    // Get the shape style, where the style.r corresponds to the R in the Illustration of Built-in Rect Combo
    const style = self.getShapeStyle(cfg);
    // Add a circle shape as keyShape which is the same as the extended 'circle' type Combo
    const circle = group.addShape('circle', {
      attrs: {
        ...style,
        x: 0,
        y: 0,
        r: style.r
      },
      draggable: true,
      name: 'combo-keyShape'
    });
    // Add the marker on the bottom
    const marker = group.addShape('marker', {
      attrs: {
        ...style,
        fill: '#fff',
        opacity: 1,
        x: 0,
        y: style.r,
        r: 10,
        symbol: collapseIcon
      },
      draggable: true,
      name: 'combo-marker-shape'
    });

    return circle;
  },
  // Define the updating logic for the marker
  afterUpdate: function afterUpdate(cfg, combo) {
    const self = this;
    // Get the shape style, where the style.r corresponds to the R in the Illustration of Built-in Rect Combo
    const style = self.getShapeStyle(cfg);
    const group = combo.get('group');
    console.log('aaaa', group);
    // Find the marker shape in the graphics group of the Combo
    const marker = group.find(ele => ele.get('name') === 'combo-marker-shape');
    // Update the marker shape
    marker.attr({
      x: 0,
      y: style.r,
      // The property 'collapsed' in the combo data represents the collapsing state of the Combo
      // Update the symbol according to 'collapsed'
      symbol: cfg.collapsed ? expandIcon : collapseIcon
    });
  }
}, 'circle');
