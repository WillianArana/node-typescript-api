import { DecodedUser } from '@src/services/auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getDecoded = (req: any): DecodedUser => req.decoded;
export default getDecoded;
