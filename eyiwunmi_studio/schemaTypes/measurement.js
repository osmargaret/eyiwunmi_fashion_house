export default {
    name: 'measurement',
    title: 'Client Measurement',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Client Name',
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
            name: 'phone',
            title: 'Phone Number',
            type: 'string',
            validation: Rule => Rule.required()
        },
        {
            name: 'shoulder',
            title: 'Shoulder (inches)',
            type: 'string'
        },
        {
            name: 'chest',
            title: 'Chest (inches)',
            type: 'string'
        },
        {
            name: 'waist',
            title: 'Waist (inches)',
            type: 'string'
        },
        {
            name: 'hips',
            title: 'Hips (inches)',
            type: 'string'
        },
        {
            name: 'sleeve',
            title: 'Sleeve Length (inches)',
            type: 'string'
        },
        {
            name: 'length',
            title: 'Trouser / Gown Length (inches)',
            type: 'string'
        },
        {
            name: 'height',
            title: 'Height (ft/inches)',
            type: 'string'
        },
        {
            name: 'notes',
            title: 'Additional Notes',
            type: 'text'
        },
        {
            name: 'submittedAt',
            title: 'Submitted At',
            type: 'datetime',
            initialValue: () => new Date().toISOString()
        }
    ]
};
