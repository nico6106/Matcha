import { useContext, useEffect, useState } from 'react';
import { ChatRetour } from '../../shared/chat';
import axios from 'axios';
import { SuccessMsg } from '../../shared/errors';
import { WebsocketContext } from '../../context/WebsocketContext';
import { SocketReceiveMsg } from './ChatDiscussion';
import { useUserContext } from '../../context/UserContext';

type PropChatDiscussions = {
    setCurrChat: any;
};
function ChatFriends({
    setCurrChat,
}: PropChatDiscussions) {
    const [chats, setChats] = useState<ChatRetour[] | null>(null);

    useEffect(() => {
        execBackendGetAllChats();
		// eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function execBackendGetAllChats() {
        try {
            const response = await axios.get(
                `http://${process.env.REACT_APP_SERVER_ADDRESS}:3333/chat/all/`,
                {
                    withCredentials: true,
                },
            );
            // console.log(response.data);
            if (response.data.message === SuccessMsg) {
                setChats(response.data.chats);
            } 
        } catch (error) {
            //to handle?
            return null;
        }
    }

    return chats ? (
        <>
            <div className="overflow-auto flex flex-row md:flex-col">
                {chats.map((elem, index) => (
                    <ChatShowIndivFriend
                        chatElem={elem}
                        setCurrChat={setCurrChat}
                        key={index}
                    />
                ))}
                {chats.length < 7 && <EmptyElems nb={7 - chats.length} />}
            </div>
        </>
    ) : (
        <div>No chats</div>
    );
}

type PropChatIndivFriend = {
    chatElem: ChatRetour;
    setCurrChat: any;
};
function ChatShowIndivFriend({ chatElem, setCurrChat }: PropChatIndivFriend) {
    const styleP: string = `flex items-center text-gray-900  ${''} group
							flex-1 md:ml-5 whitespace-nowrap space-y-2 font-bold`;
	const link: string = chatElem.picture !== '' ? `http://${process.env.REACT_APP_SERVER_ADDRESS}:3333/users/image/${chatElem.picture}` : '/carousel-2.svg';
	const altImg: string = `Picture ${chatElem.picture}`;
	const socket = useContext(WebsocketContext);
	const { user } = useUserContext();
	const [nbNotifChat, setNbNotifChat] = useState<number>(0);

    function handleOnClick() {
        // console.log('clicked chatid=' + chatElem.idChat);
        setCurrChat(chatElem.idChat);
    }

	useEffect(() => {

		setNbNotifChat(chatElem.nbUnread);

		socket.on('chat-read', (data: any) => {
			if (data.idChat === chatElem.idChat)
				setNbNotifChat(prevNbChat => (prevNbChat - data.nbRead) > 0 ? (prevNbChat - data.nbRead) : 0);
		});

		socket.on('chat', (data: SocketReceiveMsg) => {
            if (user && data.msg.sender !== user.id && data.idChat === chatElem.idChat)
				setNbNotifChat((prevnbChat) => prevnbChat + 1);
        });
	
		return () => {
			socket.off('chat');
			socket.off('chat-read');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	

    return (
        <div
            className="relative flex flex-col md:flex-row px-6 md:px-2 py-4 hover:bg-gray-300 items-center"
            onClick={handleOnClick}
        >
			<img
                        className="w-8 h-8 rounded-full"
                        src={link}
						alt={altImg}
                    />
            {nbNotifChat > 0 && (
			    <div className="ml-6 mt-3 absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full">
				    {nbNotifChat}
			    </div>
            )}
            <div className={styleP}>
                {chatElem.firstName + ' ' + chatElem.lastName}
            </div>
        </div>
    );
}

function EmptyElems({ nb }: { nb: number }) {
    const tmp: number[] = [];
    for (let i = 0; i < nb; i++) {
        tmp.push(i);
    }
    // console.log('nb to draw=' + nb);
    return (
        <>
            {tmp.map((elem, index) => (
                <div className="flex flex-row pt-7 pb-7" key={index}></div>
            ))}
        </>
    );
}

export default ChatFriends

// "bg-gray-200 hover:bg-gray-400"
