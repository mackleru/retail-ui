import * as React from 'react';
import styles from './TopBar.module.less';

const Start: React.SFC = ({ children }) => <div className={styles.startItems}>{children}</div>;

export default Start;
