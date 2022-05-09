const RESTRICTIONS = {
    TITLE_LENGTH: 127,
};

export function validatePost(data: any) {
    // check if type is correct
    if (
        !data ||
        !data.title ||
        !data.type ||
        !data.author ||
        !data.authorId ||
        !data.subreddit ||
        !data.flairs ||
        !data.isNSFW
    ) {
        return {
            success: false,
            message: 'Provided post data is invalid.',
        };
    }
    if (data.type === 'text' && !data.content) {
        return {
            success: false,
            message: `Post with a type of "text" must have a "content" field.`,
        };
    }
    if (
        data.type === 'poll' &&
        (!data.pollData ||
            !data.pollData.options ||
            !data.pollData.votes ||
            !data.pollData.votes.length)
    ) {
        return {
            success: false,
            message: `Post with a type of "poll" must have a valid "pollData" field.`,
        };
    }

    // title
    if (!data.title || data.title === '' || /^\s+$/.test(data.title))
        return {
            success: false,
            message: 'Post title cannot be empty.',
        };
    if (data.title.length > RESTRICTIONS.TITLE_LENGTH) {
        return {
            success: false,
            message: `Post title cannot be longer than ${RESTRICTIONS.TITLE_LENGTH} characters.`,
        };
    }

    // at least one image/video
    if (data.type === 'image') {
        if (
            !data.contentFiles ||
            !data.contentFiles.length ||
            data.contentFiles.length === 0
        )
            return {
                success: false,
                message: `An image post must have least one image/video.`,
            };
    }

    // poll options
    if (data.pollData?.options.includes(''))
        return {
            success: false,
            message: 'Poll cannot contain empty options.',
        };

    // remove unnecessary fields
    if (data.type === 'text') {
        delete data.contentFiles;
        delete data.pollData;
    }
    if (data.type === 'image') {
        delete data.content;
        delete data.pollData;
    }
    if (data.type === 'poll') {
        delete data.contentFiles;
    }

    return {
        success: true,
    };
}
