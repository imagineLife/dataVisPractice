const appendToParent = (parent, cl, trans) => {
	return parent.append("g")
        .attrs({
            "class": cl,
            "transform": trans
        });
}
	