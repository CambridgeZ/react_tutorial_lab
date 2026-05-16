/**
 * 404 页。
 *
 * Lab 6 完成时加上回首页链接：
 *   import { Link } from 'react-router-dom';
 *   <Link to="/">回首页</Link>
 */
export function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>404</h1>
      <p>页面不存在</p>
      {/* TODO Lab 6：加 <Link to="/">回首页</Link> */}
    </div>
  );
}
