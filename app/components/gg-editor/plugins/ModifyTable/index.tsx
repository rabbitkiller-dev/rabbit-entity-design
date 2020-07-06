import React from 'react';
import ReactDOM from 'react-dom';
import { Modal } from 'antd';
import { Graph } from 'gg-editor/lib/common/interfaces';
import { withEditorContext, constants } from 'gg-editor';
import CommandManager from 'gg-editor/lib/common/CommandManager';

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
      console.log(e.target.get('model'));
      console.log('打开', e);
      this.showEditableLabel();
    });
  }

  showEditableLabel = () => {
    this.setState(
      {
        visible: true,
      });
  };

  render() {
    const { graph } = this.props;
    return ReactDOM.createPortal(
      <Modal
        title="Basic Modal"
        visible={this.state.visible}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>,
      graph.get('container'),
    );
  }
}

export default withEditorContext<ModifyTableProps>(ModifyTable);
