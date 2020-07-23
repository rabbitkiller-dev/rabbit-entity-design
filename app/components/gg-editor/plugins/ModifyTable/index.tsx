import React from 'react';
import ReactDOM from 'react-dom';
import { Modal, Table } from 'antd';
import { Graph, Node } from 'gg-editor/lib/common/interfaces';
import { withEditorContext, constants, Util } from 'gg-editor';
import CommandManager from 'gg-editor/lib/common/CommandManager';
import { BizTableNodeModel } from '../../../../interface';

const { GraphNodeEvent } = constants;

interface ModifyTableProps {
  graph: Graph;
  executeCommand: (name: string, params?: object) => void;
  commandManager: CommandManager;
}

interface ModifyTableState {
  visible: boolean;
}

class ModifyTable extends React.Component<ModifyTableProps, ModifyTableState> {
  state = {
    visible: false,
  };

  componentDidMount() {
    const { graph } = this.props;

    graph.on(GraphNodeEvent.onNodeDoubleClick, (e) => {
      console.log(e.currentTarget.get('model'));
      console.log('打开', e);
      const node = Util.getSelectedNodes(graph)[0];
      if (!node) {
        return;
      }
      this.showEditableLabel(node);
    });
  }

  showEditableLabel = (node: Node) => {
    const model = node.getModel();
    this.setState(
      {
        visible: true,
      });
  };

  onOk() {
    this.setState(
      {
        visible: false,
      });
  }

  onCancel() {
    this.setState(
      {
        visible: false,
      });
  }

  render() {
    const { graph } = this.props;
    const node = Util.getSelectedNodes(graph)[0];
    if (!node) {
      return null;
    }
    const model: BizTableNodeModel = node.getModel() as BizTableNodeModel;
    return ReactDOM.createPortal(
      <Modal
        title="Basic Modal"
        visible={this.state.visible}
        onOk={this.onOk.bind(this)}
        onCancel={this.onCancel.bind(this)}
      >
        <label>Table</label>
        <input/>
        <div className="ant-table ant-table-small">
          <table>
            <tbody className="ant-table-tbody">
            {model.attrs.map((attr) => {
              return <tr key={attr.name} className="ant-table-row ant-table-row-level-0">
                <td>{attr.name}</td>
                <td></td>
                <td></td>
              </tr>;
            })}
            </tbody>
          </table>
        </div>
        {/*<Table columns={columns} dataSource={model.attrs}/>*/}
      </Modal>,
      graph.get('container'),
    );
  }
}

export default withEditorContext<ModifyTableProps>(ModifyTable);
