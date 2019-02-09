let lib = {};

lib.appendToParent = (parent, cl, trans) => {
	return parent.append("g")
        .attrs({
            "class": cl,
            "transform": trans
        });
}
	
lib.makeLegendArr = (colorScale, strArray) => {
    return strArray.map(str => {
        let capdWord = str.charAt(0).toUpperCase() + str.slice(1)
        return {label: capdWord, color: colorScale(str)}
    })
}

lib.addLegendToParent = (colorScale, legendParentG, customClassName, legendArr) => {

    var areaLegend = lib.appendToParent(legendParentG, customClassName, `translate(${50},${-25})`)

    var legendGWrapper = areaLegend.selectAll(".customClassName")
        .data(legendArr)
        .enter().append("g")
            .attrs({
                "class": "legendGWrapper",
                "transform": (d, i) => `translate(${(i * 150)},${(0)})`
            });
        
    let legendRects = legendGWrapper.append("rect")
        .attrs({
            "class": "legendRect",
            "width": 10,
            "height": 10,
            "fill": d => d.color,
            "fill-opacity": 0.5
        });

    let legendTexts = legendGWrapper.append("text")
        .attrs({
            "class": "legendText",
            "x": 20,
            "y": 10,
            "text-anchor": "start"
        })
        .text(d => d.label); 
}