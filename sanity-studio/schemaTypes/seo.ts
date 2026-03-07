export const seoSchema = {
  name: 'seoSettings',
  title: 'SEO Settings',
  type: 'document',
  fields: [
    {
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      description: 'The global title of the website (e.g. Herbalook | Yerba Mate).',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'siteDescription',
      title: 'Site Description',
      type: 'text',
      description: 'The meta description that appears in Google search results.',
      validation: (Rule: any) => Rule.required().max(160),
    },
    {
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Keywords for search engines to understand the page content.',
      options: {
        layout: 'tags',
      },
    },
    {
      name: 'ogImage',
      title: 'Open Graph Image (Social Share Image)',
      type: 'image',
      description: 'The image that appears when the site is shared on Facebook, WhatsApp, Slack, etc.',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'A description of the image for visually impaired users. Important for SEO.',
        },
      ],
    },
  ],
};
