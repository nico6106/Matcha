type Prop = {
    text: string;
	space?: string;
};

function TitleSmall({ text, space='10' }: Prop) {
	const styleTitle: string = `mt-${space} text-center text-2xl font-bold leading-9 tracking-tight text-gray-900`
    return (
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className={styleTitle} >
                {text}
            </h2>
        </div>
    );
}

export default TitleSmall;
