export default {
    name: 'enquiry',
    title: 'Customer Enquiry',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Customer Name',
            type: 'string',
            validation: Rule => Rule.required()
        },
        {
            name: 'email',
            title: 'Email Address',
            type: 'string',
            validation: Rule => Rule.required().email()
        },
        {
            name: 'message',
            title: 'Message',
            type: 'text',
            validation: Rule => Rule.required()
        },
        {
            name: 'submittedAt',
            title: 'Submitted At',
            type: 'datetime',
            initialValue: () => new Date().toISOString()
        }
    ]
};
