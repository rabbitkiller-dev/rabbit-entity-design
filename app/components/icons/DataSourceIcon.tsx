import React from 'react';
import Icon from '@ant-design/icons';
const Svg = () => (
  <svg className="icon" viewBox="0 0 1072 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
       p-id="2090" width="1em" height="1em">
    <path
      d="M55.94557812 735.12925156a478.91156438 232.92517031 0 1 0 957.82312969 0 478.91156438 232.92517031 0 1 0-957.82312968 0Z"
      fill="#09D0EE" p-id="2091"></path>
    <path
      d="M55.94557812 510.91156437a478.91156438 232.92517031 0 1 0 957.82312969 0 478.91156438 232.92517031 0 1 0-957.82312968 0Z"
      fill="#5792FF" p-id="2092"></path>
    <path
      d="M55.94557812 286.69387719a478.91156438 232.92517031 0 1 0 957.82312969 0 478.91156438 232.92517031 0 1 0-957.82312968 0Z"
      fill="#3023AE" p-id="2093"></path>
  </svg>
);

export default function DataSourceIcon(props) {
  return <Icon component={Svg} {...props}/>;
}
