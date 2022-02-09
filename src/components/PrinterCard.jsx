import styles from './PrinterCard.scss';
import PropTypes from 'prop-types';


const PrinterCard = props => {

    const { printerIp, isChecked } = props.printerModel; 
    const { index, updatePrinter } = props;

    const onCheckboxChange = e => {
        //Deep copy printerModel
        const updatedPrinterModel = JSON.parse(JSON.stringify(props.printerModel));
        updatedPrinterModel.isChecked = e.target.checked;

        updatePrinter(index, updatedPrinterModel);
    }
    console.log('in component')
    console.log(isChecked)
    console.log('in component')


    return (
        <div className={styles.container}>
            <h1>{printerIp}</h1>
            <input checked={isChecked ? isChecked : false} onChange={(e) => onCheckboxChange(e)} type='checkbox'/>
        </div>
    )
}

export default PrinterCard;