Package.describe({
    summary: "Type classes in Javascript"
});

Package.on_use(function (api) {
    api.use("underscore");
    api.add_files("caffeine.js", ["client", "server"]);
    api.export(['makeClass', 'K', 'Constructor',
                'Functor', 'fmap',
                'Monoid', 'unit', 'mappend', 'prod', 'mconcat', 'combine',
                'EJSONable'], ["client", "server"]);
});
