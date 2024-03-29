import axios from 'axios';
import { RetourType } from '../../types/response';

async function GetMe(): Promise<RetourType | null> {
    try {
        const response = await axios.get(
            `http://${process.env.REACT_APP_SERVER_ADDRESS}:3333/users/me`,

            {
                withCredentials: true,
            },
        );
        return response.data;
    } catch (error) {
        //to handle ?
		return null;
    }
}

export default GetMe;
