let lib = {};

//appends a "g" element to a parent element
//parent MUST be in a D3 selection
lib.appendToParent = (parent, cl, trans) => {
	return parent.append("g")
        .attrs({
            "class": cl,
            "transform": trans
        });
}

//makes array of objects
//consumable for legend creation
lib.makeLegendArr = (colorScale, strArray) => {
    return strArray.map(str => {
        let capdWord = str.charAt(0).toUpperCase() + str.slice(1)
        return {label: capdWord, color: colorScale(str)}
    })
}

//appends a legend to the parent element
//parent MUST be in D3 selecttion
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

lib.getLessMargins = (w, h, m) => {    
    let wLM = (w - m.left - m.right);
    let hLM = (h - m.top - m.bottom);
    return {wLM, hLM}
}