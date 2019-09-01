import ColorFunctions from '../../lib/styles/ColorFunctions';
import { css } from '../../lib/theming/Emotion';
import { ITheme } from '../../lib/theming/Theme';
import styles from './DateFragmentsView.less';

const jsStyles = {
  root(t: ITheme) {
    return css`
      & ::selection {
        background: ${ColorFunctions.fade(t.dateInputComponentSelectedBgColor, 0.99)};
      }
      & ::-moz-selection {
        background: ${t.dateInputComponentSelectedBgColor};
      }
    `;
  },

  mask(t: ITheme) {
    return css`
      color: ${t.dateInputMaskColor};
    `;
  },

  selected(t: ITheme) {
    return css`
      border-color: ${ColorFunctions.fade(t.dateInputComponentSelectedBgColor, 0.99)};
      background-color: ${t.dateInputComponentSelectedBgColor};
    `;
  },

  delimiter(t: ITheme) {
    return css`
      color: ${t.dateInputMaskColor};

      &.${styles.filled} {
        color: inherit;
        line-height: 1.34;
      }
    `;
  },
};

export default jsStyles;
