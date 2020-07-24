import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Modal, Table, Form, Row, Col, Tabs, Collapse } from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import { Graph, Node } from 'gg-editor/lib/common/interfaces';
import { withEditorContext, constants, Util } from 'gg-editor';
import CommandManager from 'gg-editor/lib/common/CommandManager';
import { BizTableAttrModel, BizTableNodeModel } from '../../../../interface';
import styles from './index.less';

interface TableModel extends BizTableNodeModel {
  attrs: AttrModel[]
}

interface AttrModel extends BizTableAttrModel {
  id: string;
  modifyEnable: boolean;
}

const { TabPane } = Tabs;
const { GraphNodeEvent } = constants;

interface ModifyTableProps {
  graph: Graph;
  executeCommand: (name: string, params?: object) => void;
  commandManager: CommandManager;
}

interface ModifyTableState {
  visible: boolean;
  select: string;
  sqlScript: string;
  model: TableModel;
}

interface Action {
  type: 'attr_add' | 'attr_modify' | 'attr_delete' | 'table_modify' | string;
  attr: AttrModel;

  run(table: TableModel): string;
}

class AttrAddAction implements Action {
  type = 'attr_add';
  attr: AttrModel;

  constructor(public origin: AttrModel) {
    this.attr = {
      id: origin.id,
      name: origin.name,
      type: origin.type,
      'default': origin.default,
      comment: origin.comment,
      notNull: origin.notNull,
      autoInc: origin.autoInc,
      unique: origin.unique,
      primaryKey: origin.primaryKey,
    } as any;
  }

  run(table: TableModel): string {
    const modify = Object.keys(this.attr).find((key) => {
      return this.attr[key] === this.origin[key];
    });
    if (!modify) {
      return undefined;
    }
    let script = `ALTER TABLE ${table.tableName} ADD ${this.attr.name} ${this.attr.type}`;
    if (this.attr.default) script += ` DEFAULT ${this.attr.default}`;
    script += this.attr.notNull ? ' NOT NULL' : ' NULL';
    return script + ';';
  }
}

class AttrModifyAction implements Action {
  type = 'attr_modify';
  attr: AttrModel;

  constructor(public origin: AttrModel) {
    this.attr = {
      id: origin.id,
      name: origin.name,
      type: origin.type,
      'default': origin.default,
      comment: origin.comment,
      notNull: origin.notNull,
      autoInc: origin.autoInc,
      unique: origin.unique,
      primaryKey: origin.primaryKey,
    } as any;
  }

  run(table: TableModel): string {
    const modify = Object.keys(this.attr).find((key) => {
      return this.attr[key] === this.origin[key];
    });
    if (!modify) {
      return undefined;
    }
    let script = `ALTER TABLE ${table.tableName} MODIFY ${this.attr.name} ${this.attr.type}`;
    if (this.attr.default && (this.attr.default !== this.origin.default)) script += ` DEFAULT ${this.attr.default}`;
    if (this.attr.notNull !== this.origin.notNull) script += this.attr.notNull ? ' NOT NULL' : ' NULL';
    return script + ';';
  }
}

class AttrDeleteAction implements Action {
  type = 'attr_delete';
  attr: AttrModel;

  constructor(public origin: AttrModel) {
    this.attr = {
      id: origin.id,
      name: origin.name,
      type: origin.type,
      'default': origin.default,
      comment: origin.comment,
      notNull: origin.notNull,
      autoInc: origin.autoInc,
      unique: origin.unique,
      primaryKey: origin.primaryKey,
    } as any;
  }

  run(table: TableModel): string {
    return `ALTER TABLE ${table.tableName} DROP ${this.attr.name};`;
  }
}

class ModifyTable extends React.Component<ModifyTableProps, ModifyTableState> {
  state: ModifyTableState = {
    visible: false,
    select: undefined,
    sqlScript: undefined,
    model: undefined,
  };
  actions: Action[] = [];

  componentDidMount() {
    const { graph } = this.props;

    graph.on(GraphNodeEvent.onNodeDoubleClick, (e) => {
      const node = Util.getSelectedNodes(graph)[0];
      if (!node || node.getModel().type !== 'bizTableNode') {
        return;
      }
      this.showEditableLabel(node);
    });
  }

  showEditableLabel = (node: Node) => {
    const model: TableModel = JSON.parse(JSON.stringify(node.getModel())) as TableModel;
    model.attrs.forEach((attr) => {
      attr.id = Util.guid();
    });
    this.actions.length = 0;
    this.setState(
      {
        visible: true,
        model: model,
        select: undefined,
        sqlScript: undefined,
      });
  };

  onOk() {
    const { executeCommand } = this.props;
    console.log(executeCommand);
    console.log(this.state.model);
    executeCommand('update', {
      id: this.state.model.id,
      updateModel: {
        tableName: this.state.model.tableName,
        attrs: this.state.model.attrs,
      },
    });
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

  clickAttrRow(attr: AttrModel) {
    this.state.model.attrs.forEach((attr) => attr.modifyEnable = false);
    this.setState({ select: attr.id, model: this.state.model });
  }

  dbClickAttrRow(attr: AttrModel) {
    this.state.model.attrs.forEach((attr) => attr.modifyEnable = false);
    this.state.model.attrs.find(_attr => _attr.id === attr.id).modifyEnable = true;
    this.setState({ select: undefined, model: this.state.model });
  }

  attrAdd() {
    this.state.model.attrs.forEach((attr) => attr.modifyEnable = false);
    const attr: AttrModel = {
      id: Util.guid(),
      name: 'column' + this.state.model.attrs.length,
      type: 'Int',
      modifyEnable: true,
    } as any;
    this.state.model.attrs.push(attr);
    this.setState({
      model: this.state.model,
    });
    this.actions.push(new AttrAddAction(attr));
    this.executeAction();
  }

  attrModify(attr: AttrModel, key, value) {
    attr = this.state.model.attrs.find(_attr => attr.id === _attr.id);
    let action = this.actions.find(action => action.attr.id === attr.id);
    if (!action) {
      action = new AttrModifyAction(attr);
      this.actions.push(action);
    }
    attr[key] = value;
    action.attr[key] = value;
    this.setState({
      model: this.state.model,
    });
    this.executeAction();
  }

  attrDelete() {
    if (!this.state.select) {
      return;
    }
    const attr = this.state.model.attrs.find((_attr) => _attr.id === this.state.select);
    const action = this.actions.find((action) => action.attr.id === this.state.select);
    if (!action || action.type === 'attr_modify') {
      this.actions = this.actions.filter((action) => action.attr.id !== this.state.select);
      this.state.model.attrs = this.state.model.attrs.filter((_attr) => _attr.id !== this.state.select);
      const deleteAction = new AttrDeleteAction(attr);
      this.actions.push(deleteAction);
    } else {
      this.actions = this.actions.filter((action) => action.attr.id !== this.state.select);
      this.state.model.attrs = this.state.model.attrs.filter((_attr) => _attr.id !== this.state.select);
    }
    this.executeAction();
  }

  executeAction() {
    let scripts: string[] = [];
    scripts.push(...this.actions.map((action) => {
      return action.run(this.state.model);
    }));
    this.setState({
      sqlScript: scripts.join('\n'),
    });
  }

  render() {
    const { graph } = this.props;
    if (!this.state.visible) {
      return null;
    }
    const model = this.state.model;
    return ReactDOM.createPortal(
      <Modal
        title="修改表"
        visible={this.state.visible}
        onOk={this.onOk.bind(this)}
        onCancel={this.onCancel.bind(this)}
      >
        <Form layout="vertical" size="small">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Table:">
                <Input value={model.tableName}/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Comment:">
                <Input value={model.tableName}/>
              </Form.Item>
            </Col>
          </Row>
          <Tabs type="card" size="small">
            <TabPane tab="列" key="1">
              <div style={{ width: '100%', display: 'flex' }}>
                <div className="ant-table ant-table-small" style={{ flex: 1 }}>
                  <table>
                    <tbody className="ant-table-tbody">
                    {model.attrs.map((attr) => {
                      if (attr.modifyEnable) {
                        return <tr key={attr.id}>
                          <td colSpan={5}>
                            <Row gutter={24}>
                              <Col span={8}>
                                <Form.Item label="Name:">
                                  <Input value={attr.name}
                                         onChange={($event) => this.attrModify(attr, 'name', $event.target.value)}/>
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Form.Item label="Type:">
                                  <Input value={attr.type}
                                         onChange={($event) => this.attrModify(attr, 'type', $event.target.value)}/>
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Form.Item label="Default:">
                                  <Input value={attr.default}
                                         onChange={($event) => this.attrModify(attr, 'default', $event.target.value)}/>
                                </Form.Item>
                              </Col>
                            </Row>
                          </td>
                        </tr>;
                      } else {
                        return <tr key={attr.id} className={classNames({
                          'ant-table-row': true,
                          'ant-table-row-level-0': true,
                          [styles.selection]: attr.id === this.state.select
                        })} onClick={() => this.clickAttrRow(attr)} onDoubleClick={() => this.dbClickAttrRow(attr)}>
                          <td className={styles.column}>{attr.name}</td>
                          <td className={styles.column}>{attr.type}</td>
                          <td className={styles.column}>/*{attr.comment}*/</td>
                        </tr>;
                      }
                    })}
                    </tbody>
                  </table>
                </div>
                <div className={styles.tools}>
                  <i onClick={this.attrAdd.bind(this)}><PlusOutlined className={styles.tools_icon}
                                                                     style={{ color: '#4cba38' }}/></i>
                  <i onClick={this.attrDelete.bind(this)}><MinusOutlined className={styles.tools_icon}
                                                                         style={{ color: '#ff6660' }}/></i>
                  <i><ArrowUpOutlined className={styles.tools_icon} style={{ color: '#02a6f2' }}/></i>
                  <i><ArrowDownOutlined className={styles.tools_icon} style={{ color: '#02a6f2' }}/></i>
                </div>
              </div>
            </TabPane>
            <TabPane tab="主键" key="2">
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
            </TabPane>
            <TabPane tab="Tab 3" key="3">
              <div className="ant-table ant-table-small">
                <table>
                  <tbody className="ant-table-tbody">
                  {model.attrs.map((attr) => {
                    return <tr key={attr.name} className={classNames({
                      'ant-table-row': true,
                      'ant-table-row-level-0': true,
                    })}>
                      <td>{attr.name}</td>
                      <td></td>
                      <td></td>
                    </tr>;
                  })}
                  </tbody>
                </table>
              </div>
            </TabPane>
          </Tabs>
        </Form>
        <Collapse ghost>
          <Collapse.Panel header="脚本" key="1">
            <Input.TextArea rows={5} value={this.state.sqlScript}></Input.TextArea>
          </Collapse.Panel>
        </Collapse>
        {/*<Table columns={columns} dataSource={model.attrs}/>*/}
      </Modal>,
      graph.get('container'),
    );
  }
}

export default withEditorContext<ModifyTableProps>(ModifyTable);
