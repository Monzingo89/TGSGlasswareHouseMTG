import ToggleableButton from './ToggleableButton';
import { BlueMana } from '../../../../components/symbols/mana';

const BlueManaButton = ({ size = 'small', toggled, handleClick }) => (
  <ToggleableButton size={size} toggled={toggled} handleClick={handleClick}>
    <BlueMana size={2} />
  </ToggleableButton>
);

export default BlueManaButton;
