import { v4 as uuidv4 } from 'uuid';
import { useRef, useEffect, useState } from 'react';

export const GameContainer = (props) => {

    const cellRefs = useRef([]);
    const boardRef = useRef();
    const [m, setM] = useState([]);

    useEffect(() => {
        const m = props.moves;
        setM(m);
    }, [props]);

    function arrayIsEmpty(array) {
        //If it's not an array, return FALSE.
        if (!Array.isArray(array)) {
            return false;
        }
        //If it is an array, check its length property
        if (array.length == 0) {
            //Return TRUE if the array is empty
            return true;
        }
        //Otherwise, return FALSE.
        return false;
    }

    const handleCellClick = (i) => {
        props.click(i);
        const el = document.getElementById('cell' + i);
        el.classList.add(props.symbol);
    }

    const RenderCells = () => {
        const arr = []
        for (let i = 0; i < m.length; i++) {
            arr.push(
                <div className="cell"
                    onClick={() => handleCellClick(i)} data-cell
                    key={uuidv4()} index={i} id={'cell' + i}> </div>
            )
        }
        return arr
    }

    return (
        <div style={{ pointerEvents: 'auto' }} ref={boardRef} className='board x' id='board'>
            {<RenderCells />}
        </div>
    )
}
