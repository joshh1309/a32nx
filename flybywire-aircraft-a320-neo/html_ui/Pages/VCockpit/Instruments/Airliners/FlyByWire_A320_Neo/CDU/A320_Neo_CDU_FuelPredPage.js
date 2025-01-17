class CDUFuelPredPage {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.FuelPredPage;
        mcdu.activeSystem = 'FMGC';
        const isFlying = parseInt(SimVar.GetSimVarValue("GROUND VELOCITY", "knots")) > 30;
        let destIdentCell = "NONE";
        let destTimeCell = "----";
        let destTimeCellColor = "[color]white";
        let destEFOBCell = "---.-";
        let destEFOBCellColor = "[color]white";

        let altIdentCell = "NONE";
        let altTimeCell = "----";
        let altTimeCellColor = "[color]white";
        let altEFOBCell = "---.-";
        let altEFOBCellColor = "[color]white";

        let rteRsvWeightCell = "---.-";
        let rteRsvPercentCell = "---.-";
        let rteRSvCellColor = "[color]white";
        let rteRsvPctColor = "{white}";

        let zfwCell = "___._";
        let zfwCgCell = (" __._");
        let zfwColor = "[color]amber";
        mcdu.onRightInput[2] = async (value) => {
            if (value === "") {
                mcdu.updateZfwVars();
                mcdu.sendDataToScratchpad(
                    (isFinite(mcdu.zeroFuelWeight) ? (mcdu.zeroFuelWeight * mcdu._conversionWeight).toFixed(1) : "") +
                    "/" +
                    (isFinite(mcdu.zeroFuelWeightMassCenter) ? mcdu.zeroFuelWeightMassCenter.toFixed(1) : ""));
            } else if (mcdu.trySetZeroFuelWeightZFWCG(value)) {
                CDUFuelPredPage.ShowPage(mcdu);
            }
        };

        let altFuelCell = "---.-";
        let altFuelTimeCell = "----";
        let altFuelColor = "[color]white";
        let altTimeColor = "{white}";

        let fobCell = "---.-";
        let fobOtherCell = "-----";
        let fobCellColor = "[color]white";

        let finalFuelCell = "---.-";
        let finalTimeCell = "----";
        let finalColor = "[color]white";

        let gwCell = "---.-";
        let cgCell = " --.-";
        let gwCgCellColor = "[color]white";

        let minDestFobCell = "---.-";
        let minDestFobCellColor = "[color]white";

        let extraFuelCell = "---.-";
        let extraTimeCell = "----";
        let extraCellColor = "[color]white";
        let extraTimeColor = "{white}";

        if (mcdu._zeroFuelWeightZFWCGEntered) {
            if (isFinite(mcdu.zeroFuelWeight)) {
                zfwCell = (mcdu.zeroFuelWeight * mcdu._conversionWeight).toFixed(1);
                zfwColor = "[color]cyan";
            }
            if (isFinite(mcdu.zeroFuelWeightMassCenter)) {
                zfwCgCell = mcdu.zeroFuelWeightMassCenter.toFixed(1);
            }
            if (isFinite(mcdu.zeroFuelWeight) && isFinite(mcdu.zeroFuelWeightMassCenter)) {
                zfwColor = "[color]cyan";
            }

            if (mcdu.altDestination) {
                altIdentCell = mcdu.altDestination.ident;
            }

            const dest = mcdu.flightPlanManager.getDestination();
            if (dest) {
                destIdentCell = dest.ident;
            }

            gwCell = "{small}" + (mcdu.getGW() * mcdu._conversionWeight).toFixed(1);
            cgCell = mcdu.getCG().toFixed(1) + "{end}";
            gwCgCellColor = "[color]green";

            fobCell = "{small}" + (mcdu.getFOB() * mcdu._conversionWeight).toFixed(1) + "{end}";
            fobOtherCell = "{inop}FF{end}";
            fobCellColor = "[color]cyan";
        }

        if (CDUInitPage.fuelPredConditionsMet(mcdu)) {
            const utcTime = SimVar.GetGlobalVarValue("ZULU TIME", "seconds");

            if (mcdu._fuelPredDone) {
                if (!mcdu.routeFinalEntered()) {
                    mcdu.tryUpdateRouteFinalFuel();
                }
                if (isFinite(mcdu.getRouteFinalFuelWeight()) && isFinite(mcdu.getRouteFinalFuelTime())) {
                    if (mcdu._rteFinalWeightEntered) {
                        finalFuelCell = "{sp}{sp}" + (mcdu.getRouteFinalFuelWeight() * mcdu._conversionWeight).toFixed(1);
                    } else {
                        finalFuelCell = "{sp}{sp}{small}" + (mcdu.getRouteFinalFuelWeight() * mcdu._conversionWeight).toFixed(1) + "{end}";
                    }
                    if (mcdu._rteFinalTimeEntered || !mcdu.routeFinalEntered()) {
                        finalTimeCell = FMCMainDisplay.minutesTohhmm(mcdu.getRouteFinalFuelTime());
                    } else {
                        finalTimeCell = "{small}" + FMCMainDisplay.minutesTohhmm(mcdu.getRouteFinalFuelTime()) + "{end}";
                    }
                    finalColor = "[color]cyan";
                }
                mcdu.onLeftInput[4] = async (value) => {
                    if (await mcdu.trySetRouteFinalFuel(value)) {
                        CDUFuelPredPage.ShowPage(mcdu);
                    }
                };

                if (mcdu.altDestination) {
                    if (mcdu._routeAltFuelEntered) {
                        if (isFinite(mcdu.getRouteAltFuelWeight())) {
                            altFuelCell = "{sp}{sp}" + (mcdu.getRouteAltFuelWeight() * mcdu._conversionWeight).toFixed(1);
                            altFuelTimeCell = "{small}" + FMCMainDisplay.minutesTohhmm(mcdu.getRouteAltFuelTime()) + "{end}";
                            altTimeColor = "{green}";
                            altFuelColor = "[color]cyan";
                        }
                    } else {
                        mcdu.tryUpdateRouteAlternate();
                        if (isFinite(mcdu.getRouteAltFuelWeight())) {
                            altFuelCell = "{sp}{sp}{small}" + (mcdu.getRouteAltFuelWeight() * mcdu._conversionWeight).toFixed(1);
                            altFuelTimeCell = FMCMainDisplay.minutesTohhmm(mcdu.getRouteAltFuelTime()) + "{end}";
                            altTimeColor = "{green}";
                            altFuelColor = "[color]cyan";
                        }
                    }
                } else {
                    altFuelCell = "{sp}{sp}{small}0.0{end}";
                    altFuelTimeCell = "----";
                    altFuelColor = "[color]green";
                    altTimeColor = "{white}";
                }
                mcdu.onLeftInput[3] = async (value) => {
                    console.log("Entered Val : " + value);
                    if (await mcdu.trySetRouteAlternateFuel(value)) {
                        CDUFuelPredPage.ShowPage(mcdu);
                    }
                };
                if (mcdu.altDestination) {
                    altIdentCell = mcdu.altDestination.ident;
                    altEFOBCellColor = "[color]green";
                    altEFOBCell = (mcdu.getAltEFOB(true) * mcdu._conversionWeight).toFixed(1);
                    if ((mcdu.getAltEFOB(true) * mcdu._conversionWeight).toFixed(1) < (mcdu._minDestFob * mcdu._conversionWeight).toFixed(1)) {
                        altEFOBCellColor = "[color]amber";
                    }
                    altTimeCellColor = "[color]green";
                }

                mcdu.tryUpdateRouteTrip(isFlying);
                const dest = mcdu.flightPlanManager.getDestination();
                if (dest) {
                    destIdentCell = dest.ident;
                }
                destEFOBCell = (mcdu.getDestEFOB(true) * mcdu._conversionWeight).toFixed(1);
                // Should we use predicted values or liveETATo and liveUTCto?
                destTimeCell = isFlying ? FMCMainDisplay.secondsToUTC(utcTime + FMCMainDisplay.minuteToSeconds(mcdu._routeTripTime))
                    : destTimeCell = FMCMainDisplay.minutesTohhmm(mcdu._routeTripTime);
                if (mcdu.altDestination) {
                    altTimeCell = isFlying ? FMCMainDisplay.secondsToUTC(utcTime + FMCMainDisplay.minuteToSeconds(mcdu._routeTripTime) + FMCMainDisplay.minuteToSeconds(mcdu.getRouteAltFuelTime()))
                        : FMCMainDisplay.minutesTohhmm(mcdu.getRouteAltFuelTime());
                }
                destEFOBCellColor = "[color]green";
                destTimeCellColor = "[color]green";

                if (isFlying) {
                    rteRsvWeightCell = "{small}0.0{end}";
                    rteRsvPercentCell = "--.-";
                    rteRSvCellColor = "[color]green";
                    rteRsvPctColor = "{white}";
                } else {
                    rteRsvWeightCell = "{sp}{sp}" + (mcdu.getRouteReservedWeight() * mcdu._conversionWeight).toFixed(1);
                    if (!mcdu._rteReservedWeightEntered) {
                        rteRsvWeightCell = "{small}" + rteRsvWeightCell + "{end}";
                    }

                    if (mcdu._rteRsvPercentOOR) {
                        rteRsvPercentCell = "--.-";
                        rteRSvCellColor = "[color]cyan";
                        rteRsvPctColor = "{white}";
                    } else {
                        rteRsvPercentCell = mcdu.getRouteReservedPercent().toFixed(1);
                        const needsPadding = rteRsvPercentCell.length <= 3;
                        if (!mcdu._rteReservedPctEntered && mcdu.routeReservedEntered()) {
                            rteRsvPercentCell = "{small}" + rteRsvPercentCell + "{end}";
                        }
                        if (needsPadding) {
                            rteRsvPercentCell = "{sp}" + rteRsvPercentCell;
                        }
                        rteRsvPctColor = "{cyan}";
                    }
                    rteRSvCellColor = "[color]cyan";

                    mcdu.onLeftInput[2] = async (value) => {
                        if (await mcdu.trySetRouteReservedFuel(value)) {
                            CDUFuelPredPage.ShowPage(mcdu);
                        }
                    };
                }

                if (mcdu._minDestFobEntered) {
                    minDestFobCell = "{sp}{sp}" + (mcdu._minDestFob * mcdu._conversionWeight).toFixed(1);
                    minDestFobCellColor = "[color]cyan";
                } else {
                    mcdu.tryUpdateMinDestFob();
                    minDestFobCell = "{sp}{sp}{small}" + (mcdu._minDestFob * mcdu._conversionWeight).toFixed(1) + "{end}";
                    minDestFobCellColor = "[color]cyan";
                }
                mcdu.onLeftInput[5] = async (value) => {
                    if (await mcdu.trySetMinDestFob(value)) {
                        CDUFuelPredPage.ShowPage(mcdu);
                    }
                };
                mcdu.checkEFOBBelowMin();

                extraFuelCell = "{small}" + (mcdu.tryGetExtraFuel(true) * mcdu._conversionWeight).toFixed(1);
                if (mcdu.tryGetExtraFuel(true) < 0) {
                    extraTimeCell = "----{end}";
                    extraTimeColor = "{white}";
                } else {
                    extraTimeCell = FMCMainDisplay.minutesTohhmm(mcdu.tryGetExtraTime(true)) + "{end}";
                    extraTimeColor = "{green}";
                }
                extraCellColor = "[color]green";

                // Currently not updating as there's no simvar to retrieve this.
                if (isFinite(mcdu.zeroFuelWeight)) {
                    zfwCell = (mcdu.zeroFuelWeight * mcdu._conversionWeight).toFixed(1);
                    zfwColor = "[color]cyan";
                }
                if (isFinite(mcdu.zeroFuelWeightMassCenter)) {
                    zfwCgCell = mcdu.zeroFuelWeightMassCenter.toFixed(1);
                }
            }
        }

        mcdu.setTemplate([
            ["FUEL PRED"],
            ["\xa0AT", "EFOB", isFlying ? "UTC" : "TIME"],
            [destIdentCell + "[color]green", destEFOBCell + destEFOBCellColor, destTimeCell + destTimeCellColor],
            [""],
            [altIdentCell + "[color]green", altEFOBCell + altEFOBCellColor, altTimeCell + altTimeCellColor],
            ["RTE RSV/%", "ZFW/ZFWCG"],
            [rteRsvWeightCell + rteRsvPctColor + "/" + rteRsvPercentCell + "{end}" + rteRSvCellColor, zfwCell + "/" + zfwCgCell + zfwColor],
            ["ALTN\xa0\xa0/TIME", "FOB{sp}{sp}{sp}{sp}{sp}"],
            [altFuelCell + altTimeColor + "/" + altFuelTimeCell + "{end}" + altFuelColor, fobCell + "/" + fobOtherCell + "{sp}{sp}" + fobCellColor],
            ["FINAL\xa0/TIME", "GW/{sp}{sp} CG"],
            [finalFuelCell + "/" + finalTimeCell + finalColor, gwCell + "/  " + cgCell + gwCgCellColor],
            ["MIN DEST FOB", "EXTRA TIME"],
            [minDestFobCell + minDestFobCellColor, extraFuelCell + extraTimeColor + "/" + extraTimeCell + "{end}" + extraCellColor]
        ]);

        mcdu.page.SelfPtr = setTimeout(() => {
            if (mcdu.page.Current === mcdu.page.FuelPredPage) {
                CDUFuelPredPage.ShowPage(mcdu);
            }
        }, mcdu.PageTimeout.Dyn);
    }
}
