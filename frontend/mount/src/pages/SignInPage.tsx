import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorField } from '../components/elems/ErrorFields';

function SignInPage() {
	const [username, setUsername] = useState<string>('');
	const [password, setpassword] = useState<string>('');

	useEffect(() => {
		console.log(username)
	}, [username])

	async function handleOnChangeUsername(e: React.ChangeEvent<HTMLInputElement>) {
        setUsername(e.target.value);
    }

    return (
        <>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" action="#" method="POST">
 
						<ErrorField name='username'	title='Username' onBlur={handleOnChangeUsername} />
						{/* <ErrorField name='password'	title='Password' onBlur={handleOnChangeUsername} /> */}


                        <div>
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Password
                                </label>
                                <div className="text-sm">
                                    <a
                                        href="#"
                                        className="font-semibold text-indigo-600 hover:text-indigo-500"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>

                    <div className="mt-10 text-center text-sm text-gray-500">
                        Not a member?
                        <p className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                            <Link to="/signup">Sign up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SignInPage;
