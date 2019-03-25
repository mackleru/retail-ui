import defaultThemeVariables from '../components/variables.less';
import flatThemeVariables from '../components/variables.flat.less';
import Upgrades from './Upgrades';

Upgrades.enableFlatDesign();

interface IndexSignature {
  [key: string]: string;
}
type VariablesObject = typeof defaultThemeVariables & typeof flatThemeVariables & IndexSignature;

export default class ThemeManager {
  public static getVariables(): VariablesObject {
    if (!this.variablesConstructed) {
      this.constructVariablesObject();
    }
    return this.variables;
  }

  public static overrideVariables(themeObject: VariablesObject): VariablesObject {
    this.variables = { ...this.variables, ...themeObject } as VariablesObject;
    return this.variables;
  }

  public static resetVariablesToDefaultValues(): VariablesObject {
    this.constructVariablesObject();
    return this.variables;
  }

  private static isFlatDesign: boolean = Upgrades.isFlatDesignEnabled();
  private static variablesConstructed: boolean = false;
  private static variables: VariablesObject = {} as VariablesObject;

  private static constructVariablesObject() {
    const bothThemesKeys = [...Object.keys(defaultThemeVariables), ...Object.keys(flatThemeVariables)] as Array<
      keyof VariablesObject
    >;

    this.variables = bothThemesKeys.reduce(
      (resultObj: VariablesObject, currentKey: keyof VariablesObject) => {
        if (this.isFlatDesign) {
          resultObj[currentKey] = (flatThemeVariables as IndexSignature)[currentKey];
        } else {
          resultObj[currentKey] = (defaultThemeVariables as IndexSignature)[currentKey];
        }
        return resultObj;
      },
      {} as VariablesObject,
    );
    this.variablesConstructed = true;
  }
}
