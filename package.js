Package.describe({
    summary: "Type classes in Javascript"
});

Package.on_use(function (api) {
    api.use(["functionalMeteor", "underscore"]);
    api.add_files("caffeine.js", ["client", "server"]);
    api.export(['makeClass', 'K', 'Constructor', 'vtable',
                'Functor', 'fmap',
                'Monoid', 'mempty', 'mappend', 'prod', 'mconcat',
                'Sum', 'plus', 'sum',
                'Product', 'times', 'prod',
                'EJSONable'], ["client", "server"]);
});
