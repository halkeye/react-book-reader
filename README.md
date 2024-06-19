
# Book Reader (book-reader)

> ...

## Running your project

```bash
$ node server.dev.js
```

# Notes

```xml
<DocumentTitle title="Select A Book">
	<BookList />
</DocumentTitle>

<!-- Language Selection-->
<DocumentTitle title={book.title + " - Select A Language"}>
	<LanguageSelection book="josephine" />
</DocumentTitle>

<!-- Book -->
<Book name="josephine" language="en" page="1">
	<DocumentTitle title={book.title}>
		<Screen />
		<!-- OR -->
		<BookPage>
			<canvas>
				<BookLine>
					<BookWord/>
				</BookLine>
			</canvas>
		</BookPage>
	</DocumentTitle>
</DocumentTitle>
```

```
* App just has <Page>
* <Page> has its normal stuff, plus <BookPage> (which includes hammer js)
* <BookPage> Also has on swipe and on tap
* App.transitionPage => Checks to make sure its a valid target
* Migrate more code out of Screen class so we don't have play audio on game pages
* Make ogg default
* Fix clicking on hotspot when window is scrolled
```

# FROM TEMPLATE

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
