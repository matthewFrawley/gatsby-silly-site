module.exports = {
  siteMetadata: {
    title: `Gatsby Silly Site`,
    description: `The Jabberwocky poem by Lewis Carroll`,
    author: `@matthewFrawley @loopspeed`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `jabberwocky-poem`,
        short_name: `jabberwocky`,
        start_url: `/`,
        background_color: `#0E0026`,
        theme_color: `#E6005F`,
        display: `minimal-ui`,
        icon: `src/images/icon.png`, // This path is relative to the root of the site.
      },
    },
    // Required to get @use working with SASS and Gatsby.
    {
      resolve: `gatsby-plugin-sass`,
      options: {
        implementation: require("sass"),
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
